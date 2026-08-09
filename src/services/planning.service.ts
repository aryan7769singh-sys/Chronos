/**
 * planning.service.ts
 *
 * Service layer for the Planning & Time Blocking domain.
 * All Prisma operations for TimeBlocks are isolated here.
 *
 * Architecture: Page → Service → Prisma
 *
 * Key rules:
 * - Every query is scoped to userId (tenant isolation).
 * - Every active query filters deletedAt: null.
 * - Project ownership is verified through project.userId === userId.
 * - Task ownership is verified through task.project.userId === userId.
 * - Conflict detection is mandatory (bypass only with explicit allowConflict).
 * - TimeBlock = PLANNED time. FocusSession = ACTUAL execution time. These are separate.
 */

import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  differenceInMinutes,
  addDays,
} from "date-fns";
import type {
  TimeBlock,
  TimeBlockWithRelations,
  TimeBlockStatus,
  CreateTimeBlockInput,
  UpdateTimeBlockInput,
  PlanningSummary,
  ScheduleConflict,
  ConflictCheckResult,
  PlanningStats,
} from "@/features/planning/types";
import type { ProjectColor, TaskStatus, Priority } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Internal Prisma shape
// ---------------------------------------------------------------------------

type PrismaTimeBlock = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: string;
  color: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
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
    status: string;
    priority: string;
    estimatedDuration: number;
    actualDuration: number;
    currentStep: string;
  } | null;
};

function mapTimeBlock(raw: PrismaTimeBlock): TimeBlock {
  return {
    id: raw.id,
    userId: raw.userId,
    projectId: raw.projectId,
    taskId: raw.taskId,
    title: raw.title,
    description: raw.description,
    startTime: raw.startTime.toISOString(),
    endTime: raw.endTime.toISOString(),
    status: raw.status as TimeBlockStatus,
    color: (raw.color as ProjectColor) || "violet",
    notes: raw.notes,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}

function mapTimeBlockWithRelations(raw: PrismaTimeBlock): TimeBlockWithRelations {
  return {
    ...mapTimeBlock(raw),
    project: raw.project
      ? {
          id: raw.project.id,
          name: raw.project.name,
          color: raw.project.color as ProjectColor,
          icon: raw.project.icon,
        }
      : null,
    task: raw.task
      ? {
          id: raw.task.id,
          title: raw.task.title,
          status: raw.task.status as TaskStatus,
          priority: raw.task.priority as Priority,
          estimatedDuration: raw.task.estimatedDuration,
          actualDuration: raw.task.actualDuration,
          currentStep: raw.task.currentStep,
        }
      : null,
  };
}

const INCLUDE_RELATIONS = {
  project: { select: { id: true, name: true, color: true, icon: true } },
  task: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      estimatedDuration: true,
      actualDuration: true,
      currentStep: true,
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Ownership Validation Helpers
// ---------------------------------------------------------------------------

async function validateProjectOwnership(
  projectId: string,
  userId: string
): Promise<void> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
    select: { id: true },
  });
  if (!project) {
    throw new Error("Referenced project not found or does not belong to you.");
  }
}

async function validateTaskOwnership(
  taskId: string,
  userId: string
): Promise<{ projectId: string }> {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      deletedAt: null,
      project: { userId, deletedAt: null },
    },
    select: { id: true, projectId: true },
  });
  if (!task) {
    throw new Error("Referenced task not found or does not belong to you.");
  }
  return { projectId: task.projectId };
}

// ---------------------------------------------------------------------------
// Conflict Detection
// ---------------------------------------------------------------------------

/**
 * Detects overlapping TimeBlocks for the same user within the requested time window.
 *
 * Two blocks overlap when:
 *   existing.startTime < requestedEndTime AND existing.endTime > requestedStartTime
 *
 * Adjacent blocks (09:00–10:00 and 10:00–11:00) are NOT conflicts.
 */
export async function detectConflicts(
  userId: string,
  startTime: Date,
  endTime: Date,
  excludeBlockId?: string
): Promise<ConflictCheckResult> {
  const overlapping = await prisma.timeBlock.findMany({
    where: {
      userId,
      deletedAt: null,
      status: { notIn: ["cancelled", "skipped"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeBlockId ? { id: { not: excludeBlockId } } : {}),
    },
    include: INCLUDE_RELATIONS,
    orderBy: { startTime: "asc" },
  });

  if (overlapping.length === 0) {
    return { hasConflict: false, conflicts: [] };
  }

  const conflicts: ScheduleConflict[] = overlapping.map((block) => {
    const overlapStart = block.startTime > startTime ? block.startTime : startTime;
    const overlapEnd = block.endTime < endTime ? block.endTime : endTime;
    const overlapMinutes = Math.max(differenceInMinutes(overlapEnd, overlapStart), 0);
    return {
      conflictingBlock: mapTimeBlockWithRelations(block),
      overlapMinutes,
    };
  });

  return { hasConflict: true, conflicts };
}

// ---------------------------------------------------------------------------
// Query Functions
// ---------------------------------------------------------------------------

/**
 * Returns all active TimeBlocks for a user within a date range.
 */
export async function getTimeBlocks(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeBlockWithRelations[]> {
  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      deletedAt: null,
      startTime: { lt: endDate },
      endTime: { gt: startDate },
    },
    include: INCLUDE_RELATIONS,
    orderBy: { startTime: "asc" },
  });
  return blocks.map(mapTimeBlockWithRelations);
}

/**
 * Returns a single TimeBlock by ID, scoped to the authenticated user.
 */
export async function getTimeBlockById(
  userId: string,
  blockId: string
): Promise<TimeBlockWithRelations | null> {
  const block = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId, deletedAt: null },
    include: INCLUDE_RELATIONS,
  });
  if (!block) return null;
  return mapTimeBlockWithRelations(block);
}

/**
 * Returns all active TimeBlocks for today (authenticated user).
 */
export async function getTodaysTimeBlocks(
  userId: string
): Promise<TimeBlockWithRelations[]> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  return getTimeBlocks(userId, dayStart, dayEnd);
}

/**
 * Returns upcoming TimeBlocks for the next 7 days (excluding today).
 */
export async function getUpcomingTimeBlocks(
  userId: string
): Promise<TimeBlockWithRelations[]> {
  const now = new Date();
  const rangeStart = endOfDay(now);
  const rangeEnd = endOfDay(addDays(now, 7));
  return getTimeBlocks(userId, rangeStart, rangeEnd);
}

/**
 * Computes a planning summary for a specific day.
 */
export async function getDailyPlanningSummary(
  userId: string,
  date: Date
): Promise<PlanningSummary> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      deletedAt: null,
      startTime: { lt: dayEnd },
      endTime: { gt: dayStart },
    },
    select: {
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  let plannedMinutes = 0;
  let completedMinutes = 0;
  let skippedMinutes = 0;
  let blocksCompleted = 0;
  let blocksSkipped = 0;
  let blocksRemaining = 0;

  for (const b of blocks) {
    const duration = differenceInMinutes(b.endTime, b.startTime);
    if (b.status === "completed") {
      completedMinutes += duration;
      blocksCompleted++;
    } else if (b.status === "skipped" || b.status === "cancelled") {
      skippedMinutes += duration;
      blocksSkipped++;
    } else {
      // planned or in_progress
      plannedMinutes += duration;
      blocksRemaining++;
    }
  }

  const denominator = completedMinutes + plannedMinutes; // exclude skipped from denominator
  const completionPercentage =
    denominator > 0 ? Math.round((completedMinutes / denominator) * 100) : 0;

  // Quick conflict check
  const conflictCheck = await detectConflicts(
    userId,
    dayStart,
    dayEnd
  );

  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    totalBlocks: blocks.length,
    plannedMinutes,
    completedMinutes,
    remainingMinutes: plannedMinutes,
    skippedMinutes,
    completionPercentage,
    blocksRemaining,
    blocksCompleted,
    blocksSkipped,
    hasConflicts: conflictCheck.hasConflict,
  };
}

// ---------------------------------------------------------------------------
// Mutation Functions
// ---------------------------------------------------------------------------

/**
 * Creates a new TimeBlock with full ownership validation and conflict detection.
 */
export async function createTimeBlock(
  userId: string,
  input: CreateTimeBlockInput
): Promise<{ block: TimeBlockWithRelations; conflicts: ScheduleConflict[] }> {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  if (endTime <= startTime) {
    throw new Error("End time must be after start time.");
  }

  // Resolve project from task if taskId is given
  let resolvedProjectId: string | null = input.projectId ?? null;

  if (input.taskId) {
    const { projectId: taskProjectId } = await validateTaskOwnership(input.taskId, userId);
    if (resolvedProjectId && resolvedProjectId !== taskProjectId) {
      throw new Error("The selected task does not belong to the selected project.");
    }
    resolvedProjectId = taskProjectId;
  }

  if (resolvedProjectId && !input.taskId) {
    await validateProjectOwnership(resolvedProjectId, userId);
  }

  // Conflict detection
  const conflictResult = await detectConflicts(userId, startTime, endTime);
  if (conflictResult.hasConflict && !input.allowConflict) {
    // Return conflicts without creating the block
    return {
      block: null as unknown as TimeBlockWithRelations,
      conflicts: conflictResult.conflicts,
    };
  }

  const block = await prisma.timeBlock.create({
    data: {
      userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      startTime,
      endTime,
      projectId: resolvedProjectId,
      taskId: input.taskId ?? null,
      color: input.color ?? "violet",
      notes: input.notes?.trim() ?? "",
      status: "planned",
    },
    include: INCLUDE_RELATIONS,
  });

  return { block: mapTimeBlockWithRelations(block), conflicts: [] };
}

/**
 * Updates an existing TimeBlock after verifying ownership.
 */
export async function updateTimeBlock(
  userId: string,
  blockId: string,
  input: UpdateTimeBlockInput
): Promise<{ block: TimeBlockWithRelations; conflicts: ScheduleConflict[] }> {
  const existing = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("Time block not found or access denied.");
  }

  const newStart = input.startTime ? new Date(input.startTime) : existing.startTime;
  const newEnd = input.endTime ? new Date(input.endTime) : existing.endTime;

  if (newEnd <= newStart) {
    throw new Error("End time must be after start time.");
  }

  // Resolve ownership for project/task changes
  let resolvedProjectId: string | null | undefined =
    input.projectId !== undefined ? input.projectId : existing.projectId;

  const newTaskId =
    input.taskId !== undefined ? input.taskId : existing.taskId;

  if (newTaskId) {
    const { projectId: taskProjectId } = await validateTaskOwnership(newTaskId, userId);
    if (resolvedProjectId && resolvedProjectId !== taskProjectId) {
      throw new Error("The selected task does not belong to the selected project.");
    }
    resolvedProjectId = taskProjectId;
  } else if (newTaskId === null) {
    // task was explicitly cleared
    if (resolvedProjectId) {
      await validateProjectOwnership(resolvedProjectId, userId);
    }
  } else if (resolvedProjectId) {
    await validateProjectOwnership(resolvedProjectId, userId);
  }

  // Time-sensitive operations need conflict detection
  const timeChanged =
    input.startTime !== undefined || input.endTime !== undefined;
  if (timeChanged) {
    const conflictResult = await detectConflicts(userId, newStart, newEnd, blockId);
    if (conflictResult.hasConflict && !input.allowConflict) {
      return {
        block: null as unknown as TimeBlockWithRelations,
        conflicts: conflictResult.conflicts,
      };
    }
  }

  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.startTime !== undefined ? { startTime: newStart } : {}),
      ...(input.endTime !== undefined ? { endTime: newEnd } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.notes !== undefined ? { notes: input.notes.trim() } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.projectId !== undefined ? { projectId: resolvedProjectId } : {}),
      ...(input.taskId !== undefined ? { taskId: newTaskId } : {}),
    },
    include: INCLUDE_RELATIONS,
  });

  return { block: mapTimeBlockWithRelations(updated), conflicts: [] };
}

/**
 * Soft-deletes a TimeBlock.
 */
export async function deleteTimeBlock(
  userId: string,
  blockId: string
): Promise<void> {
  const existing = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("Time block not found or access denied.");
  }
  await prisma.timeBlock.update({
    where: { id: blockId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Marks a TimeBlock as completed.
 */
export async function completeTimeBlock(
  userId: string,
  blockId: string
): Promise<TimeBlockWithRelations> {
  const existing = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("Time block not found or access denied.");
  }
  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: { status: "completed" },
    include: INCLUDE_RELATIONS,
  });
  return mapTimeBlockWithRelations(updated);
}

/**
 * Marks a TimeBlock as skipped.
 */
export async function skipTimeBlock(
  userId: string,
  blockId: string
): Promise<TimeBlockWithRelations> {
  const existing = await prisma.timeBlock.findFirst({
    where: { id: blockId, userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("Time block not found or access denied.");
  }
  const updated = await prisma.timeBlock.update({
    where: { id: blockId },
    data: { status: "skipped" },
    include: INCLUDE_RELATIONS,
  });
  return mapTimeBlockWithRelations(updated);
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

/**
 * Returns aggregated planning statistics for a date range (for Analytics).
 */
export async function getPlanningStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PlanningStats> {
  const blocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      deletedAt: null,
      startTime: { gte: startDate, lt: endDate },
    },
    select: {
      startTime: true,
      endTime: true,
      status: true,
      taskId: true,
    },
  });

  if (blocks.length === 0) {
    return {
      totalPlannedMinutes: 0,
      totalCompletedMinutes: 0,
      totalSkippedMinutes: 0,
      scheduleCompletionPercentage: 0,
      totalBlocks: 0,
      completedBlocks: 0,
      skippedBlocks: 0,
      cancelledBlocks: 0,
      plannedBlocks: 0,
      avgPlanningAccuracyPercentage: null,
      hasData: false,
    };
  }

  let totalPlanned = 0;
  let totalCompleted = 0;
  let totalSkipped = 0;
  let completedCount = 0;
  let skippedCount = 0;
  let cancelledCount = 0;
  let plannedCount = 0;

  for (const b of blocks) {
    const minutes = differenceInMinutes(b.endTime, b.startTime);
    if (b.status === "completed") {
      totalCompleted += minutes;
      completedCount++;
    } else if (b.status === "skipped") {
      totalSkipped += minutes;
      skippedCount++;
    } else if (b.status === "cancelled") {
      cancelledCount++;
    } else {
      totalPlanned += minutes;
      plannedCount++;
    }
  }

  const denominator = totalCompleted + totalPlanned;
  const scheduleCompletionPercentage =
    denominator > 0 ? Math.round((totalCompleted / denominator) * 100) : 0;

  // Compare planned duration vs actual focus time for task-linked completed blocks
  const completedTaskBlocks = blocks.filter(
    (b) => b.status === "completed" && b.taskId
  );

  let accuracyPercentage: number | null = null;
  if (completedTaskBlocks.length > 0) {
    const taskIds = [...new Set(completedTaskBlocks.map((b) => b.taskId!))];
    const focusSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        taskId: { in: taskIds },
        completed: true,
        deletedAt: null,
        createdAt: { gte: startDate, lt: endDate },
      },
      select: { taskId: true, duration: true },
    });

    const actualByTask = new Map<string, number>();
    for (const fs of focusSessions) {
      if (fs.taskId) {
        actualByTask.set(
          fs.taskId,
          (actualByTask.get(fs.taskId) ?? 0) + Math.round(fs.duration / 60)
        );
      }
    }

    let totalPlannedForCompleted = 0;
    let totalActualForCompleted = 0;
    for (const b of completedTaskBlocks) {
      const planned = differenceInMinutes(b.endTime, b.startTime);
      const actual = actualByTask.get(b.taskId!) ?? 0;
      if (actual > 0) {
        totalPlannedForCompleted += planned;
        totalActualForCompleted += actual;
      }
    }

    if (totalPlannedForCompleted > 0) {
      accuracyPercentage = Math.min(
        100,
        Math.round((totalActualForCompleted / totalPlannedForCompleted) * 100)
      );
    }
  }

  return {
    totalPlannedMinutes: totalPlanned + totalCompleted,
    totalCompletedMinutes: totalCompleted,
    totalSkippedMinutes: totalSkipped,
    scheduleCompletionPercentage,
    totalBlocks: blocks.length,
    completedBlocks: completedCount,
    skippedBlocks: skippedCount,
    cancelledBlocks: cancelledCount,
    plannedBlocks: plannedCount,
    avgPlanningAccuracyPercentage: accuracyPercentage,
    hasData: true,
  };
}
