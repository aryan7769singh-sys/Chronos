// ---------------------------------------------------------------------------
// Planning & Time Blocking Domain Types
// ---------------------------------------------------------------------------
// Architecture: Page → Service → Prisma
// TimeBlock = PLANNED time. FocusSession = ACTUAL executed time.
// These concepts are intentionally separated.
// ---------------------------------------------------------------------------

import type { ProjectColor, Priority, TaskStatus } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type TimeBlockStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "skipped"
  | "cancelled";

// ---------------------------------------------------------------------------
// Core TimeBlock DTO (safe to pass to client components)
// ---------------------------------------------------------------------------

export interface TimeBlock {
  id: string;
  userId: string;

  projectId: string | null;
  taskId: string | null;

  title: string;
  description: string;

  /** ISO timestamp — planned start */
  startTime: string;
  /** ISO timestamp — planned end */
  endTime: string;

  status: TimeBlockStatus;
  color: ProjectColor;
  notes: string;

  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// TimeBlock with resolved project/task metadata
// ---------------------------------------------------------------------------

export interface TimeBlockWithRelations extends TimeBlock {
  project: {
    id: string;
    name: string;
    color: ProjectColor;
    icon: string;
  } | null;

  task: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    estimatedDuration: number;
    actualDuration: number;
    currentStep: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Input DTOs
// ---------------------------------------------------------------------------

export interface CreateTimeBlockInput {
  title: string;
  description?: string;

  /** ISO string or Date representing local start time */
  startTime: string | Date;
  /** ISO string or Date representing local end time */
  endTime: string | Date;

  projectId?: string | null;
  taskId?: string | null;

  color?: ProjectColor;
  notes?: string;

  /**
   * When true, skip conflict detection and create the block even if
   * it overlaps an existing block. The user must explicitly set this.
   */
  allowConflict?: boolean;
}

export interface UpdateTimeBlockInput {
  title?: string;
  description?: string;
  startTime?: string | Date;
  endTime?: string | Date;
  projectId?: string | null;
  taskId?: string | null;
  color?: ProjectColor;
  notes?: string;
  status?: TimeBlockStatus;
  /** Set to true to bypass conflict detection on update. */
  allowConflict?: boolean;
}

// ---------------------------------------------------------------------------
// Conflict Detection
// ---------------------------------------------------------------------------

export interface ScheduleConflict {
  conflictingBlock: TimeBlockWithRelations;
  /** Overlap in minutes */
  overlapMinutes: number;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflicts: ScheduleConflict[];
}

// ---------------------------------------------------------------------------
// Planning Summary (per-day)
// ---------------------------------------------------------------------------

export interface PlanningSummary {
  date: string; // "yyyy-MM-dd"
  totalBlocks: number;
  plannedMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  skippedMinutes: number;
  completionPercentage: number;
  blocksRemaining: number;
  blocksCompleted: number;
  blocksSkipped: number;
  hasConflicts: boolean;
}

// ---------------------------------------------------------------------------
// Planning Range Query Input
// ---------------------------------------------------------------------------

export interface PlanningRange {
  startDate: Date;
  endDate: Date;
}

// ---------------------------------------------------------------------------
// Planning Stats (for Analytics)
// ---------------------------------------------------------------------------

export interface PlanningStats {
  totalPlannedMinutes: number;
  totalCompletedMinutes: number;
  totalSkippedMinutes: number;
  scheduleCompletionPercentage: number;
  totalBlocks: number;
  completedBlocks: number;
  skippedBlocks: number;
  cancelledBlocks: number;
  plannedBlocks: number;
  /** Average planned vs actual ratio — null when no focus data to compare */
  avgPlanningAccuracyPercentage: number | null;
  hasData: boolean;
}
