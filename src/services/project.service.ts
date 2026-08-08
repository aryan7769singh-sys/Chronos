/**
 * project.service.ts
 *
 * Service layer for Project domain objects.
 * All Prisma calls for projects are isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import {
  ProjectStatus as PrismaProjectStatus,
  ProjectHealth as PrismaProjectHealth,
  Priority as PrismaPriority,
} from "@prisma/client";
import type {
  Project,
  Task,
  Subtask,
  ProjectStatus,
  ProjectColor,
  Priority,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/features/tasks/types";
import { calculateTaskProgress } from "@/features/tasks/utils/progress";
import { calculateProjectHealth } from "@/features/tasks/utils/health";

// ---------------------------------------------------------------------------
// Enum mappings
// ---------------------------------------------------------------------------

// ProjectStatus values are identical between Prisma and app types.
function mapProjectStatus(s: PrismaProjectStatus): ProjectStatus {
  return s as ProjectStatus;
}

// Priority values are identical between Prisma and app types.
function mapPriority(p: PrismaPriority): Priority {
  return p as Priority;
}

function mapAppPriorityToPrisma(p: Priority): PrismaPriority {
  return p as PrismaPriority;
}

function mapAppStatusToPrisma(s: ProjectStatus): PrismaProjectStatus {
  return s as PrismaProjectStatus;
}

// ---------------------------------------------------------------------------
// Internal Prisma result types
// (Inlined to avoid importing generated Prisma types into components)
// ---------------------------------------------------------------------------

type PrismaSubtask = {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  deletedAt: Date | null;
};

type PrismaTask = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: import("@prisma/client").TaskStatus;
  priority: PrismaPriority;
  estimatedDuration: number;
  actualDuration: number;
  deadline: Date;
  currentStep: string;
  tags: string[];
  notes: string;
  createdAt: Date;
  deletedAt: Date | null;
  subtasks: PrismaSubtask[];
};

type PrismaProject = {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: PrismaProjectStatus;
  priority: PrismaPriority;
  deadline: Date;
  health: string;
  createdAt: Date;
  deletedAt: Date | null;
  tasks: PrismaTask[];
};

// ---------------------------------------------------------------------------
// Internal computation helpers
// ---------------------------------------------------------------------------

/**
 * Given a raw Prisma project with nested tasks and subtasks, computes:
 * - per-task progress (derived from subtask completion ratios)
 * - overall project progress (average of task progress values)
 * - project health (timeline-based, via the existing utility)
 * - taskCount and completedTaskCount
 *
 * Returns a fully-shaped app Project object.
 */
function mapProject(raw: PrismaProject): Project {
  const activeTasks = raw.tasks ? raw.tasks.filter((t) => !t.deletedAt) : [];
  const taskCount = activeTasks.length;
  const completedTaskCount = activeTasks.filter(
    (t) => t.status === "done"
  ).length;

  // Step 1: compute progress for each task from its active subtasks
  const taskProgressValues: number[] = activeTasks.map((t) => {
    const activeSubtasks = t.subtasks ? t.subtasks.filter((s) => !s.deletedAt) : [];
    const subtaskAppValues: Subtask[] = activeSubtasks.map((s) => ({
      id: s.id,
      taskId: s.taskId,
      title: s.title,
      completed: s.completed,
    }));
    return calculateTaskProgress(subtaskAppValues);
  });

  // Step 2: compute overall project progress
  const progress =
    taskProgressValues.length > 0
      ? Math.round(
          taskProgressValues.reduce((acc, v) => acc + v, 0) /
            taskProgressValues.length
        )
      : 0;

  // Step 3: build a partial project object for the health utility.
  const projectForHealth: Project = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    color: (raw.color as ProjectColor) || "violet",
    icon: raw.icon || "Layers",
    status: mapProjectStatus(raw.status),
    priority: mapPriority(raw.priority),
    deadline: raw.deadline.toISOString(),
    progress,
    health: "on-track", // placeholder — replaced below
    taskCount,
    completedTaskCount,
    createdAt: raw.createdAt.toISOString(),
  };

  // Step 4: compute health. Pass minimal Task[] shapes (only .progress is read).
  const tasksForHealth: Task[] = taskProgressValues.map((taskProgress, i) => ({
    id: activeTasks[i].id,
    projectId: raw.id,
    title: "",
    description: "",
    status: "backlog" as const,
    priority: "medium" as const,
    estimatedDuration: 0,
    actualDuration: 0,
    deadline: activeTasks[i].deadline.toISOString(),
    progress: taskProgress,
    currentStep: "",
    tags: [],
    notes: "",
    createdAt: activeTasks[i].createdAt.toISOString(),
  }));

  const health = calculateProjectHealth(projectForHealth, tasksForHealth);

  return { ...projectForHealth, health };
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

/**
 * Returns all non-deleted projects with computed progress and health.
 * Scoped to userId when provided.
 */
export async function getAllProjects(userId?: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(userId ? { userId } : {}),
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: {
          subtasks: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return projects.map((p) => mapProject(p as unknown as PrismaProject));
}

/**
 * Returns a single non-deleted project with computed progress and health.
 * Scoped to userId when provided. Returns null if not found or soft-deleted.
 */
export async function getProjectById(
  id: string,
  userId?: string
): Promise<Project | null> {
  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(userId ? { userId } : {}),
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: {
          subtasks: { where: { deletedAt: null } },
        },
      },
    },
  });

  if (!project) return null;
  return mapProject(project as unknown as PrismaProject);
}

/**
 * Creates a new project owned by the authenticated user.
 */
export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const deadlineDate = input.deadline
    ? new Date(input.deadline)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const record = await prisma.project.create({
    data: {
      userId,
      name: input.name.trim(),
      description: input.description?.trim() || "",
      color: input.color || "violet",
      icon: input.icon || "Layers",
      priority: input.priority
        ? mapAppPriorityToPrisma(input.priority)
        : PrismaPriority.medium,
      deadline: deadlineDate,
      status: PrismaProjectStatus.active,
      health: PrismaProjectHealth.on_track,
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: {
          subtasks: { where: { deletedAt: null } },
        },
      },
    },
  });

  return mapProject(record as unknown as PrismaProject);
}

/**
 * Updates an existing project ensuring user ownership.
 */
export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Project not found or unauthorized.");
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      name: input.name !== undefined ? input.name.trim() : undefined,
      description:
        input.description !== undefined ? input.description.trim() : undefined,
      color: input.color !== undefined ? input.color : undefined,
      icon: input.icon !== undefined ? input.icon : undefined,
      priority:
        input.priority !== undefined
          ? mapAppPriorityToPrisma(input.priority)
          : undefined,
      status:
        input.status !== undefined
          ? mapAppStatusToPrisma(input.status)
          : undefined,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: {
          subtasks: { where: { deletedAt: null } },
        },
      },
    },
  });

  return mapProject(updated as unknown as PrismaProject);
}

/**
 * Soft-deletes a project ensuring user ownership.
 */
export async function deleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Project not found or unauthorized.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      deletedAt: new Date(),
    },
  });
}
