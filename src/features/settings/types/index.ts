// ---------------------------------------------------------------------------
// Settings & Personalization Domain Types
// ---------------------------------------------------------------------------
// Architecture: Page → Service → Prisma
// Strongly typed settings DTOs. Avoid `any`.
// ---------------------------------------------------------------------------

import type { ProjectColor } from "@/features/tasks/types";

export type ThemePreference = "light" | "dark" | "system";
export type DensityPreference = "compact" | "comfortable";
export type CalendarViewPreference = "month" | "week" | "day";
export type SoundThemeOption = "chime" | "bell" | "digital" | "minimal";

export interface AppearanceSettings {
  theme: ThemePreference;
  accentColor: ProjectColor;
  uiDensity: DensityPreference;
  reducedMotion: boolean;
}

export interface FocusSettings {
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodoroCycles: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  soundTheme: SoundThemeOption;
}

export interface PlanningSettings {
  defaultCalendarView: CalendarViewPreference;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  defaultTimeBlockMinutes: number;
  workdayStart: string; // "HH:mm" e.g. "09:00"
  workdayEnd: string; // "HH:mm" e.g. "17:00"
}

export interface NotificationSettings {
  taskDeadlineReminders: boolean;
  timeBlockReminders: boolean;
  focusCompletionNotifications: boolean;
  breakCompletionNotifications: boolean;
  habitReminders: boolean;
  dailyPlanningReminder: boolean;
}

export interface OverlaySettings {
  overlayEnabled: boolean;
  overlayOpacity: number; // 20 - 100
  overlayCompact: boolean;
  overlayShowCurrentTask: boolean;
  overlayShowTimer: boolean;
  overlayShowNextBlock: boolean;
  overlayShowProgress: boolean;
  overlayShowUrgentTasks: boolean;
  overlayUrgentTaskCount: number; // 1, 2, or 3
  overlayShowNotifications: boolean;
}


export interface ShortcutItem {
  id: string;
  key: string; // e.g. "Space", "R", "F", "N", "P", "T", "O", "Escape"
  label: string;
  description: string;
  category: "focus" | "navigation" | "creation" | "overlay";
  editable: boolean;
}

export interface UserSettings {
  id: string;
  userId: string;
  appearance: AppearanceSettings;
  focus: FocusSettings;
  planning: PlanningSettings;
  notifications: NotificationSettings;
  overlay: OverlaySettings;
  shortcuts: ShortcutItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  appearance?: Partial<AppearanceSettings>;
  focus?: Partial<FocusSettings>;
  planning?: Partial<PlanningSettings>;
  notifications?: Partial<NotificationSettings>;
  overlay?: Partial<OverlaySettings>;
  customShortcuts?: Record<string, string>;
}
