/**
 * task.service.ts
 *
 * Service layer for Task and Subtask domain operations.
 * All Prisma database operations for tasks and subtasks are isolated here.
 * All queries and mutations strictly verify authenticated user ownership
 * through the parent Project relation.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import {
  TaskStatus as PrismaTaskStatus,
  Priority as PrismaPriority,
  type Prisma,
} from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";
import type {
  Task,
  TaskWithProject,
  Subtask,
  TaskStatus,
  Priority,
  TaskStats,
  CreateTaskInput,
  UpdateTaskInput,
  ProjectColor,
} from "@/features/tasks/types";
import { calculateTaskProgress } from "@/features/tasks/utils/progress";

// ---------------------------------------------------------------------------
// Enum mappings
// Prisma enum identifiers use underscores; app types use hyphens where needed.
// ---------------------------------------------------------------------------

const TASK_STATUS_MAP: Record<PrismaTaskStatus, TaskStatus> = {
  backlog: "backlog",
  todo: "todo",
  in_progress: "in-progress",
  blocked: "blocked",
  in_review: "in-review",
  done: "done",
  cancelled: "cancelled",
};

const APP_TO_PRISMA_STATUS_MAP: Record<TaskStatus, PrismaTaskStatus> = {
  backlog: PrismaTaskStatus.backlog,
  todo: PrismaTaskStatus.todo,
  "in-progress": PrismaTaskStatus.in_progress,
  blocked: PrismaTaskStatus.blocked,
  "in-review": PrismaTaskStatus.in_review,
  done: PrismaTaskStatus.done,
  cancelled: PrismaTaskStatus.cancelled,
};

function mapPriority(p: PrismaPriority): Priority {
  return p as Priority;
}

function mapAppPriorityToPrisma(p: Priority): PrismaPriority {
  return p as PrismaPriority;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

type PrismaSubtaskRecord = {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  deletedAt: Date | null;
};

function mapSubtask(s: PrismaSubtaskRecord): Subtask {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    completed: s.completed,
  };
}

type PrismaTaskWithSubtasks = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: PrismaTaskStatus;
  priority: PrismaPriority;
  estimatedDuration: number;
  actualDuration: number;
  deadline: Date;
  currentStep: string;
  tags: string[];
  notes: string;
  createdAt: Date;
  subtasks: PrismaSubtaskRecord[];
};

function mapTask(t: PrismaTaskWithSubtasks): Task {
  const activeSubtasks = t.subtasks ? t.subtasks.filter((s) => !s.deletedAt) : [];
  const progress = calculateTaskProgress(activeSubtasks.map(mapSubtask));

  return {
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: TASK_STATUS_MAP[t.status],
    priority: mapPriority(t.priority),
    estimatedDuration: t.estimatedDuration,
    actualDuration: t.actualDuration,
    deadline: t.deadline.toISOString(),
    progress,
    currentStep: t.currentStep,
    tags: t.tags,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
  };
}

type PrismaTaskWithProjectAndSubtasks = PrismaTaskWithSubtasks & {
  project: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
};

function mapTaskWithProject(t: PrismaTaskWithProjectAndSubtasks): TaskWithProject {
  const base = mapTask(t);
  const activeSubtasks = t.subtasks ? t.subtasks.filter((s) => !s.deletedAt) : [];
  const completedCount = activeSubtasks.filter((s) => s.completed).length;

  return {
    ...base,
    project: {
      id: t.project.id,
      name: t.project.name,
      color: (t.project.color as ProjectColor) || "violet",
      icon: t.project.icon || "Layers",
    },
    subtaskCount: activeSubtasks.length,
    completedSubtaskCount: completedCount,
  };
}

// ---------------------------------------------------------------------------
// Global Query Services
// ---------------------------------------------------------------------------

/**
 * Returns all non-deleted tasks belonging to the authenticated user across all projects.
 * Supports filtering by search term, status, priority, project, and due date windows.
 */
export async function getAllTasksByUserId(
  userId: string,
  filters?: {
    search?: string;
    status?: TaskStatus | "all";
    priority?: Priority | "all";
    projectId?: string | "all";
    dueFilter?: "all" | "today" | "upcoming" | "overdue";
  }
): Promise<TaskWithProject[]> {
  const whereClause: Prisma.TaskWhereInput = {
    deletedAt: null,
    project: {
      userId,
      deletedAt: null,
    },
  };

  // Search filter
  if (filters?.search && filters.search.trim() !== "") {
    const q = filters.search.trim();
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { currentStep: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  // Status filter
  if (filters?.status && filters.status !== "all") {
    whereClause.status = APP_TO_PRISMA_STATUS_MAP[filters.status];
  }

  // Priority filter
  if (filters?.priority && filters.priority !== "all") {
    whereClause.priority = mapAppPriorityToPrisma(filters.priority);
  }

  // Project filter
  if (filters?.projectId && filters.projectId !== "all") {
    whereClause.projectId = filters.projectId;
  }

  // Due date filter
  if (filters?.dueFilter && filters.dueFilter !== "all") {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    if (filters.dueFilter === "today") {
      whereClause.deadline = {
        gte: todayStart,
        lte: todayEnd,
      };
    } else if (filters.dueFilter === "overdue") {
      whereClause.deadline = {
        lt: todayStart,
      };
      // Overdue tasks are only relevant if not done or cancelled
      whereClause.status = {
        notIn: [PrismaTaskStatus.done, PrismaTaskStatus.cancelled],
      };
    } else if (filters.dueFilter === "upcoming") {
      whereClause.deadline = {
        gt: todayEnd,
      };
    }
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
  });

  return tasks.map(mapTaskWithProject);
}

/**
 * Returns tasks for Today's Focus and Today's Tasks widgets on the Dashboard.
 * Includes tasks due today or overdue, excluding done/cancelled.
 */
export async function getTodaysTasks(userId: string): Promise<TaskWithProject[]> {
  const now = new Date();
  const todayEnd = endOfDay(now);

  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      project: {
        userId,
        deletedAt: null,
      },
      deadline: {
        lte: todayEnd,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "asc" },
      { deadline: "asc" },
    ],
    take: 10,
  });

  return tasks.map(mapTaskWithProject);
}

/**
 * Returns upcoming deadline tasks for the Dashboard widget.
 */
export async function getUpcomingDeadlines(
  userId: string,
  limit: number = 5
): Promise<TaskWithProject[]> {
  const tasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      project: {
        userId,
        deletedAt: null,
      },
      status: {
        notIn: [PrismaTaskStatus.done, PrismaTaskStatus.cancelled],
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      },
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: {
      deadline: "asc",
    },
    take: limit,
  });

  return tasks.map(mapTaskWithProject);
}

/**
 * Computes high-level aggregated statistics across all active tasks for a user.
 */
export async function getTaskStats(userId: string): Promise<TaskStats> {
  const allTasks = await prisma.task.findMany({
    where: {
      deletedAt: null,
      project: {
        userId,
        deletedAt: null,
      },
    },
    select: {
      status: true,
      priority: true,
      deadline: true,
    },
  });

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  let todoCount = 0;
  let inProgressCount = 0;
  let doneCount = 0;
  let blockedCount = 0;
  let dueTodayCount = 0;
  let overdueCount = 0;
  let urgentCount = 0;

  for (const t of allTasks) {
    if (t.status === PrismaTaskStatus.todo || t.status === PrismaTaskStatus.backlog) {
      todoCount++;
    } else if (
      t.status === PrismaTaskStatus.in_progress ||
      t.status === PrismaTaskStatus.in_review
    ) {
      inProgressCount++;
    } else if (t.status === PrismaTaskStatus.done) {
      doneCount++;
    } else if (t.status === PrismaTaskStatus.blocked) {
      blockedCount++;
    }

    if (t.priority === PrismaPriority.urgent || t.priority === PrismaPriority.high) {
      urgentCount++;
    }

    const isDone = t.status === PrismaTaskStatus.done || t.status === PrismaTaskStatus.cancelled;
    if (!isDone) {
      if (t.deadline >= todayStart && t.deadline <= todayEnd) {
        dueTodayCount++;
      } else if (t.deadline < todayStart) {
        overdueCount++;
      }
    }
  }

  return {
    total: allTasks.length,
    todoCount,
    inProgressCount,
    doneCount,
    blockedCount,
    dueTodayCount,
    overdueCount,
    urgentCount,
  };
}

// ---------------------------------------------------------------------------
// Project-Scoped Query Services (Backward Compatible)
// ---------------------------------------------------------------------------

/**
 * Returns all non-deleted tasks belonging to a project.
 * Scoped to userId when provided to enforce ownership.
 */
export async function getTasksByProjectId(
  projectId: string,
  userId?: string
): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(userId ? { project: { userId, deletedAt: null } } : {}),
    },
    include: {
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return tasks.map(mapTask);
}

/**
 * Returns a single task by project and task ID (or taskId and userId).
 */
export async function getTaskById(
  projectIdOrTaskId: string,
  taskIdOrUserId: string,
  userId?: string
): Promise<Task | null> {
  const task = await prisma.task.findFirst({
    where: {
      OR: [
        {
          id: taskIdOrUserId,
          projectId: projectIdOrTaskId,
          deletedAt: null,
          ...(userId ? { project: { userId, deletedAt: null } } : {}),
        },
        {
          id: projectIdOrTaskId,
          project: {
            userId: userId || taskIdOrUserId,
            deletedAt: null,
          },
          deletedAt: null,
        },
      ],
    },
    include: {
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) return null;
  return mapTask(task);
}

/**
 * Returns all non-deleted subtasks belonging to a task.
 */
export async function getSubtasksByTaskId(
  taskId: string,
  userId?: string
): Promise<Subtask[]> {
  const subtasks = await prisma.subtask.findMany({
    where: {
      taskId,
      deletedAt: null,
      ...(userId
        ? {
            task: {
              deletedAt: null,
              project: { userId, deletedAt: null },
            },
          }
        : {}),
    },
    orderBy: { createdAt: "asc" },
  });

  return subtasks.map(mapSubtask);
}

// ---------------------------------------------------------------------------
// Mutation Services
// ---------------------------------------------------------------------------

/**
 * Creates a new task under a project owned by the authenticated user.
 */
export async function createTask(
  userId: string,
  input: CreateTaskInput
): Promise<Task> {
  // Verify user ownership of the parent project
  const project = await prisma.project.findFirst({
    where: {
      id: input.projectId,
      userId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error("Project not found or unauthorized.");
  }

  const deadlineDate = input.deadline ? new Date(input.deadline) : new Date();

  const record = await prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      status: input.status
        ? APP_TO_PRISMA_STATUS_MAP[input.status]
        : PrismaTaskStatus.todo,
      priority: input.priority
        ? mapAppPriorityToPrisma(input.priority)
        : PrismaPriority.medium,
      deadline: deadlineDate,
      estimatedDuration: input.estimatedDuration || 30,
      currentStep: input.currentStep?.trim() || "",
      tags: input.tags || [],
      notes: input.notes?.trim() || "",
    },
    include: {
      subtasks: true,
    },
  });

  return mapTask(record);
}

/**
 * Updates an existing task ensuring user ownership through the project.
 */
export async function updateTask(
  taskId: string,
  userId: string,
  input: UpdateTaskInput
): Promise<Task> {
  // Verify user ownership
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized.");
  }

  // If changing project, verify target project ownership
  if (input.projectId && input.projectId !== existing.projectId) {
    const targetProject = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        userId,
        deletedAt: null,
      },
    });
    if (!targetProject) {
      throw new Error("Target project not found or unauthorized.");
    }
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: input.title !== undefined ? input.title.trim() : undefined,
      description:
        input.description !== undefined ? input.description.trim() : undefined,
      projectId: input.projectId !== undefined ? input.projectId : undefined,
      status:
        input.status !== undefined
          ? APP_TO_PRISMA_STATUS_MAP[input.status]
          : undefined,
      priority:
        input.priority !== undefined
          ? mapAppPriorityToPrisma(input.priority)
          : undefined,
      deadline: input.deadline ? new Date(input.deadline) : undefined,
      estimatedDuration:
        input.estimatedDuration !== undefined
          ? input.estimatedDuration
          : undefined,
      actualDuration:
        input.actualDuration !== undefined ? input.actualDuration : undefined,
      currentStep:
        input.currentStep !== undefined ? input.currentStep.trim() : undefined,
      tags: input.tags !== undefined ? input.tags : undefined,
      notes: input.notes !== undefined ? input.notes.trim() : undefined,
    },
    include: {
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return mapTask(updated);
}

/**
 * Soft-deletes a task ensuring user ownership.
 */
export async function deleteTask(taskId: string, userId: string): Promise<void> {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized.");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Toggles or updates task status.
 */
export async function toggleTaskStatus(
  taskId: string,
  userId: string,
  nextStatus?: TaskStatus
): Promise<Task> {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        userId,
        deletedAt: null,
      },
      deletedAt: null,
    },
    include: {
      subtasks: {
        where: { deletedAt: null },
      },
    },
  });

  if (!existing) {
    throw new Error("Task not found or unauthorized.");
  }

  let targetStatus: PrismaTaskStatus;
  if (nextStatus) {
    targetStatus = APP_TO_PRISMA_STATUS_MAP[nextStatus];
  } else {
    // If no explicit status provided, toggle done <-> todo
    targetStatus =
      existing.status === PrismaTaskStatus.done
        ? PrismaTaskStatus.todo
        : PrismaTaskStatus.done;
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: targetStatus,
    },
    include: {
      subtasks: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return mapTask(updated);
}

/**
 * Toggles completion status of a subtask ensuring full user ownership.
 */
export async function toggleSubtask(
  subtaskId: string,
  userId: string
): Promise<Subtask> {
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      deletedAt: null,
      task: {
        deletedAt: null,
        project: {
          userId,
          deletedAt: null,
        },
      },
    },
  });

  if (!subtask) {
    throw new Error("Subtask not found or unauthorized.");
  }

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      completed: !subtask.completed,
    },
  });

  return mapSubtask(updated);
}
