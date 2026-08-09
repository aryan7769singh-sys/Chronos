import type { TimeBlockStatus } from "../types";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Status display metadata
// ---------------------------------------------------------------------------

export const TIME_BLOCK_STATUS_LABELS: Record<TimeBlockStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  skipped: "Skipped",
  cancelled: "Cancelled",
};

export const TIME_BLOCK_STATUS_COLORS: Record<TimeBlockStatus, string> = {
  planned: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  skipped: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export const TIME_BLOCK_STATUS_DOT: Record<TimeBlockStatus, string> = {
  planned: "bg-violet-500",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  skipped: "bg-muted-foreground",
  cancelled: "bg-destructive",
};

// ---------------------------------------------------------------------------
// Color options (matching ProjectColor union)
// ---------------------------------------------------------------------------

export const PLANNING_COLOR_OPTIONS: ProjectColor[] = [
  "violet",
  "blue",
  "amber",
  "emerald",
  "red",
  "pink",
];

// ---------------------------------------------------------------------------
// Time grid constants (must match DayView/WeekView HOUR_HEIGHT)
// ---------------------------------------------------------------------------

export const PLANNING_HOUR_HEIGHT_DAY = 68; // px per hour in DayView
export const PLANNING_HOUR_HEIGHT_WEEK = 56; // px per hour in WeekView
