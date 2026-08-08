/**
 * focus.service.ts
 *
 * Service layer for Focus and Deep Work domain objects.
 * All Prisma calls for focus sessions are isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import type {
  FocusSession,
  CreateFocusSessionInput,
  FocusSummary,
  FocusTaskInfo,
  TimerMode,
} from "@/features/timer/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";
import { startOfDay, endOfDay } from "date-fns";

// ---------------------------------------------------------------------------
// Internal Prisma result mapping
// ---------------------------------------------------------------------------

type PrismaFocusSession = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  mode: string;
  duration: number;
  targetDuration: number;
  completed: boolean;
  notes: string;
  createdAt: Date;
  deletedAt: Date | null;
  project?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  task?: {
    id: string;
    title: string;
    priority: import("@prisma/client").Priority;
  } | null;
};

function mapFocusSession(raw: PrismaFocusSession): FocusSession {
  return {
    id: raw.id,
    userId: raw.userId,
    projectId: raw.projectId,
    taskId: raw.taskId,
    mode: raw.mode as TimerMode,
    duration: raw.duration,
    targetDuration: raw.targetDuration,
    completed: raw.completed,
    notes: raw.notes,
    createdAt: raw.createdAt.toISOString(),
    project: raw.project
      ? {
          id: raw.project.id,
          name: raw.project.name,
          color: (raw.project.color as ProjectColor) || "violet",
          icon: raw.project.icon || "Layers",
        }
      : null,
    task: raw.task
      ? {
          id: raw.task.id,
          title: raw.task.title,
          priority: raw.task.priority as Priority,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Public Service Methods
// ---------------------------------------------------------------------------

/**
 * Records a completed or elapsed focus session in PostgreSQL.
 * If linked to a task (and not a break), atomically increments Task.actualDuration in minutes.
 */
export async function createFocusSession(
  userId: string,
  input: CreateFocusSessionInput
): Promise<FocusSession> {
  // Validate ownership if taskId or projectId provided
  let effectiveProjectId = input.projectId || null;

  if (input.taskId) {
    const task = await prisma.task.findFirst({
      where: {
        id: input.taskId,
        project: {
          userId,
          deletedAt: null,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
      },
    });

    if (!task) {
      throw new Error("Task not found or unauthorized.");
    }
    effectiveProjectId = task.projectId;
  } else if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!project) {
      throw new Error("Project not found or unauthorized.");
    }
  }

  // Calculate minutes to increment on Task.actualDuration (Task.actualDuration is stored in minutes)
  const isWorkSession =
    input.mode !== "short_break" && input.mode !== "long_break";
  const durationMinutes = Math.round(input.duration / 60);

  // Atomic transaction: create FocusSession + update Task.actualDuration
  const result = await prisma.$transaction(async (tx) => {
    const sessionRecord = await tx.focusSession.create({
      data: {
        userId,
        projectId: effectiveProjectId,
        taskId: input.taskId || null,
        mode: input.mode,
        duration: Math.max(0, input.duration),
        targetDuration: Math.max(0, input.targetDuration),
        completed: input.completed !== undefined ? input.completed : true,
        notes: input.notes?.trim() || "",
      },
      include: {
        project: {
          select: { id: true, name: true, color: true, icon: true },
        },
        task: {
          select: { id: true, title: true, priority: true },
        },
      },
    });

    if (input.taskId && isWorkSession && durationMinutes > 0) {
      await tx.task.update({
        where: { id: input.taskId },
        data: {
          actualDuration: {
            increment: durationMinutes,
          },
        },
      });
    }

    return sessionRecord;
  });

  return mapFocusSession(result as unknown as PrismaFocusSession);
}

/**
 * Returns today's focus metrics for a user (total minutes, sessions count, daily goal).
 */
export async function getFocusSummary(userId: string): Promise<FocusSummary> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const todaySessions = await prisma.focusSession.findMany({
    where: {
      userId,
      deletedAt: null,
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: {
      duration: true,
      mode: true,
      completed: true,
    },
  });

  // Sum duration in seconds for work sessions (exclude breaks)
  let totalWorkSeconds = 0;
  let completedCount = 0;

  for (const sess of todaySessions) {
    if (sess.mode !== "short_break" && sess.mode !== "long_break") {
      totalWorkSeconds += sess.duration;
      if (sess.completed) {
        completedCount++;
      }
    }
  }

  const todayFocusMinutes = Math.round(totalWorkSeconds / 60);

  return {
    todayFocusMinutes,
    todayCompletedSessions: completedCount,
    dailyGoalMinutes: 120, // 2 hours default daily goal
    currentStreak: 1,
  };
}

/**
 * Returns recent focus sessions for the authenticated user.
 */
export async function getRecentFocusSessions(
  userId: string,
  limit = 10
): Promise<FocusSession[]> {
  const sessions = await prisma.focusSession.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      project: {
        select: { id: true, name: true, color: true, icon: true },
      },
      task: {
        select: { id: true, title: true, priority: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return sessions.map((s: unknown) =>
    mapFocusSession(s as PrismaFocusSession)
  );
}

/**
 * Returns the highest-priority active task for the user to recommend for focus.
 */
export async function getTodaysFocusTask(
  userId: string
): Promise<FocusTaskInfo | null> {
  const task = await prisma.task.findFirst({
    where: {
      deletedAt: null,
      status: {
        in: ["in_progress", "todo"],
      },
      project: {
        userId,
        deletedAt: null,
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
    },
    orderBy: [
      { priority: "asc" }, // urgent -> high -> medium -> low
      { deadline: "asc" },
      { createdAt: "desc" },
    ],
  });

  if (!task) return null;

  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    projectName: task.project.name,
    projectColor: (task.project.color as ProjectColor) || "violet",
    projectIcon: task.project.icon || "Layers",
    priority: task.priority as Priority,
    currentStep: task.currentStep || undefined,
    estimatedDuration: task.estimatedDuration,
    actualDuration: task.actualDuration,
  };
}

/**
 * Soft-deletes a focus session ensuring user ownership.
 */
export async function deleteFocusSession(
  sessionId: string,
  userId: string
): Promise<void> {
  const existing = await prisma.focusSession.findFirst({
    where: {
      id: sessionId,
      userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Focus session not found or unauthorized.");
  }

  await prisma.focusSession.update({
    where: { id: sessionId },
    data: {
      deletedAt: new Date(),
    },
  });
}
