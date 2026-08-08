/**
 * task.service.ts
 *
 * Service layer for Task and Subtask domain objects.
 * All Prisma calls are isolated here — no other file imports from @prisma/client
 * for task-related queries.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import {
  TaskStatus as PrismaTaskStatus,
  Priority as PrismaPriority,
} from "@prisma/client";
import type { Task, Subtask, TaskStatus, Priority } from "@/features/tasks/types";
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

// Priority values match exactly between Prisma and app types — no mapping needed.
// The cast below is safe because the enum values are identical strings.
function mapPriority(p: PrismaPriority): Priority {
  return p as Priority;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Maps a raw Prisma Subtask record to the app's Subtask type.
 * Excludes soft-deleted subtasks.
 */
type PrismaSubtask = {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  deletedAt: Date | null;
};

function mapSubtask(s: PrismaSubtask): Subtask {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    completed: s.completed,
  };
}

/**
 * Maps a raw Prisma Task (with subtasks included) to the app's Task type.
 * Progress is derived from subtask completion.
 */
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
  subtasks: PrismaSubtask[];
};

function mapTask(t: PrismaTaskWithSubtasks): Task {
  const activeSubtasks = t.subtasks.filter((s) => !s.deletedAt);
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

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

/**
 * Returns all non-deleted tasks belonging to a project.
 * Progress is derived from active subtask completion ratios.
 */
export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      deletedAt: null,
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
 * Returns a single task by project and task ID.
 * Returns null if the task does not exist or is soft-deleted.
 */
export async function getTaskById(
  projectId: string,
  taskId: string
): Promise<Task | null> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      projectId,
      deletedAt: null,
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
 * Used by the task detail page to render the SubtaskChecklist component.
 */
export async function getSubtasksByTaskId(taskId: string): Promise<Subtask[]> {
  const subtasks = await prisma.subtask.findMany({
    where: {
      taskId,
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });

  return subtasks.map(mapSubtask);
}
