// ---------------------------------------------------------------------------
// Desktop Overlay & Command HUD Domain Types
// ---------------------------------------------------------------------------
// Architecture: Page → Service → Prisma
// DTOs for the calm, high-density heads-up command display.
// ---------------------------------------------------------------------------

import type { FocusTaskInfo, FocusSummary } from "@/features/timer/types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import type { UserSettings } from "@/features/settings/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";

export type OverlayModuleKey =
  | "focus"
  | "task"
  | "timeblock"
  | "nextblock"
  | "progress"
  | "deadline"
  | "actions";

export interface OverlayDeadlineInfo {
  id: string;
  projectId: string;
  title: string;
  deadline: string; // ISO string
  priority: Priority;
  projectName: string;
  projectColor: ProjectColor;
  isOverdue: boolean;
}

export interface OverlayHUDData {
  userSettings: UserSettings;
  activeFocusTask: FocusTaskInfo | null;
  currentBlock: TimeBlockWithRelations | null;
  nextBlock: TimeBlockWithRelations | null;
  upcomingDeadline: OverlayDeadlineInfo | null;
  focusSummary: FocusSummary;
  completedTasksCountToday: number;
}
