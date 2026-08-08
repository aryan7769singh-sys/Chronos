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
  Priority as PrismaPriority,
} from "@prisma/client";
import type {
  Project,
  Task,
  Subtask,
  ProjectStatus,
  ProjectColor,
  Priority,
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
 *
 * Returns a fully-shaped app Project object.
 */
function mapProject(raw: PrismaProject): Project {
  const activeTasks = raw.tasks.filter((t) => !t.deletedAt);

  // Step 1: compute progress for each task from its active subtasks
  const taskProgressValues: number[] = activeTasks.map((t) => {
    const activeSubtasks = t.subtasks.filter((s) => !s.deletedAt);
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
  // Only the fields consumed by calculateProjectHealth are needed here.
  const projectForHealth: Project = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    color: raw.color as ProjectColor,
    icon: raw.icon,
    status: mapProjectStatus(raw.status),
    priority: mapPriority(raw.priority),
    deadline: raw.deadline.toISOString(),
    progress,
    health: "on-track", // placeholder — replaced below
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
 */
export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
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

  return projects.map(mapProject);
}

/**
 * Returns a single non-deleted project with computed progress and health.
 * Returns null if not found or soft-deleted.
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
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
  return mapProject(project);
}
