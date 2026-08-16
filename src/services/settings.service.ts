/**
 * settings.service.ts
 *
 * Service layer for Settings & Personalization domain.
 * All Prisma database operations for UserSettings are isolated here.
 *
 * Key rules:
 * - Every query is strictly scoped to userId (tenant isolation).
 * - Creates default settings automatically if none exist.
 * - Validates and clamps numeric bounds.
 * - Preserves existing fields during partial updates.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  UserSettings,
  UpdateSettingsInput,
  ThemePreference,
  DensityPreference,
  CalendarViewPreference,
  SoundThemeOption,
} from "@/features/settings/types";
import {
  DEFAULT_USER_SETTINGS,
  DEFAULT_KEYBOARD_SHORTCUTS,
  FOCUS_NUMERIC_LIMITS,
} from "@/features/settings/constants/domain";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Helper: Map Prisma UserSettings row to strongly-typed UserSettings DTO
// ---------------------------------------------------------------------------

type PrismaUserSettingsRaw = {
  id: string;
  userId: string;
  theme: string;
  accentColor: string;
  uiDensity: string;
  reducedMotion: boolean;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodoroCycles: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  soundTheme: string;
  defaultCalendarView: string;
  weekStartsOn: number;
  defaultTimeBlockMinutes: number;
  workdayStart: string;
  workdayEnd: string;
  taskDeadlineReminders: boolean;
  timeBlockReminders: boolean;
  focusCompletionNotifications: boolean;
  breakCompletionNotifications: boolean;
  habitReminders: boolean;
  dailyPlanningReminder: boolean;
  overlayEnabled: boolean;
  overlayOpacity: number;
  overlayCompact: boolean;
  overlayShowCurrentTask: boolean;
  overlayShowTimer: boolean;
  overlayShowNextBlock: boolean;
  overlayShowProgress: boolean;
  overlayShowUrgentTasks: boolean;
  overlayUrgentTaskCount: number;
  overlayShowNotifications: boolean;
  overlayPreset: string;
  overlayDensity: string;
  overlayBlur: number;
  overlayBorder: string;
  overlayTimerSize: string;
  overlayTimerGlow: boolean;
  overlayTimerWeight: string;
  launchOnStartup: boolean;
  launchMinimized: boolean;
  startupMode: string;
  customShortcuts: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

function mapPrismaSettingsToDTO(raw: PrismaUserSettingsRaw): UserSettings {
  // Parse custom shortcuts JSON or fall back to default registry
  let shortcuts = DEFAULT_KEYBOARD_SHORTCUTS;
  if (raw.customShortcuts && typeof raw.customShortcuts === "object") {
    const customMap = raw.customShortcuts as Record<string, string>;
    shortcuts = DEFAULT_KEYBOARD_SHORTCUTS.map((item) => {
      if (item.editable && customMap[item.id]) {
        return { ...item, key: customMap[item.id] };
      }
      return item;
    });
  }

  return {
    id: raw.id,
    userId: raw.userId,
    appearance: {
      theme: (raw.theme as ThemePreference) || DEFAULT_USER_SETTINGS.appearance.theme,
      accentColor: (raw.accentColor as ProjectColor) || DEFAULT_USER_SETTINGS.appearance.accentColor,
      uiDensity: (raw.uiDensity as DensityPreference) || DEFAULT_USER_SETTINGS.appearance.uiDensity,
      reducedMotion: raw.reducedMotion ?? false,
    },
    focus: {
      pomodoroMinutes: raw.pomodoroMinutes ?? DEFAULT_USER_SETTINGS.focus.pomodoroMinutes,
      shortBreakMinutes: raw.shortBreakMinutes ?? DEFAULT_USER_SETTINGS.focus.shortBreakMinutes,
      longBreakMinutes: raw.longBreakMinutes ?? DEFAULT_USER_SETTINGS.focus.longBreakMinutes,
      pomodoroCycles: raw.pomodoroCycles ?? DEFAULT_USER_SETTINGS.focus.pomodoroCycles,
      autoStartBreaks: raw.autoStartBreaks ?? false,
      autoStartWork: raw.autoStartWork ?? false,
      soundEnabled: raw.soundEnabled ?? true,
      soundVolume: raw.soundVolume ?? 80,
      soundTheme: (raw.soundTheme as SoundThemeOption) || "chime",
    },
    planning: {
      defaultCalendarView:
        (raw.defaultCalendarView as CalendarViewPreference) || DEFAULT_USER_SETTINGS.planning.defaultCalendarView,
      weekStartsOn: (raw.weekStartsOn === 1 ? 1 : 0) as 0 | 1,
      defaultTimeBlockMinutes: raw.defaultTimeBlockMinutes ?? 60,
      workdayStart: raw.workdayStart || "09:00",
      workdayEnd: raw.workdayEnd || "17:00",
    },
    notifications: {
      taskDeadlineReminders: raw.taskDeadlineReminders ?? true,
      timeBlockReminders: raw.timeBlockReminders ?? true,
      focusCompletionNotifications: raw.focusCompletionNotifications ?? true,
      breakCompletionNotifications: raw.breakCompletionNotifications ?? true,
      habitReminders: raw.habitReminders ?? true,
      dailyPlanningReminder: raw.dailyPlanningReminder ?? true,
    },
    overlay: {
      overlayEnabled: raw.overlayEnabled ?? true,
      overlayOpacity: raw.overlayOpacity ?? 90,
      overlayCompact: raw.overlayCompact ?? false,
      overlayShowCurrentTask: raw.overlayShowCurrentTask ?? true,
      overlayShowTimer: raw.overlayShowTimer ?? true,
      overlayShowNextBlock: raw.overlayShowNextBlock ?? true,
      overlayShowProgress: raw.overlayShowProgress ?? true,
      overlayShowUrgentTasks: raw.overlayShowUrgentTasks ?? true,
      overlayUrgentTaskCount: raw.overlayUrgentTaskCount ?? 3,
      overlayShowNotifications: raw.overlayShowNotifications ?? true,
      overlayPreset: (raw.overlayPreset as UserSettings["overlay"]["overlayPreset"]) || "custom",
      overlayDensity: (raw.overlayDensity as UserSettings["overlay"]["overlayDensity"]) || "comfortable",
      overlayBlur: raw.overlayBlur ?? 20,
      overlayBorder: (raw.overlayBorder as UserSettings["overlay"]["overlayBorder"]) || "normal",
      overlayTimerSize: (raw.overlayTimerSize as UserSettings["overlay"]["overlayTimerSize"]) || "large",
      overlayTimerGlow: raw.overlayTimerGlow ?? true,
      overlayTimerWeight: (raw.overlayTimerWeight as UserSettings["overlay"]["overlayTimerWeight"]) || "bold",
      launchOnStartup: raw.launchOnStartup ?? false,
      launchMinimized: raw.launchMinimized ?? false,
      startupMode: (raw.startupMode as UserSettings["overlay"]["startupMode"]) || "widget",
    },
    shortcuts,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };
}



// Helper: clamp numbers to limits
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// ---------------------------------------------------------------------------
// Service Functions
// ---------------------------------------------------------------------------

/**
 * Gets or creates settings for a user.
 * Guaranteed to return a valid UserSettings object.
 */
export async function getOrCreateUserSettings(userId: string): Promise<UserSettings> {
  let record = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!record) {
    record = await prisma.userSettings.create({
      data: {
        userId,
        theme: DEFAULT_USER_SETTINGS.appearance.theme,
        accentColor: DEFAULT_USER_SETTINGS.appearance.accentColor,
        uiDensity: DEFAULT_USER_SETTINGS.appearance.uiDensity,
        reducedMotion: DEFAULT_USER_SETTINGS.appearance.reducedMotion,

        pomodoroMinutes: DEFAULT_USER_SETTINGS.focus.pomodoroMinutes,
        shortBreakMinutes: DEFAULT_USER_SETTINGS.focus.shortBreakMinutes,
        longBreakMinutes: DEFAULT_USER_SETTINGS.focus.longBreakMinutes,
        pomodoroCycles: DEFAULT_USER_SETTINGS.focus.pomodoroCycles,
        autoStartBreaks: DEFAULT_USER_SETTINGS.focus.autoStartBreaks,
        autoStartWork: DEFAULT_USER_SETTINGS.focus.autoStartWork,
        soundEnabled: DEFAULT_USER_SETTINGS.focus.soundEnabled,
        soundVolume: DEFAULT_USER_SETTINGS.focus.soundVolume,
        soundTheme: DEFAULT_USER_SETTINGS.focus.soundTheme,

        defaultCalendarView: DEFAULT_USER_SETTINGS.planning.defaultCalendarView,
        weekStartsOn: DEFAULT_USER_SETTINGS.planning.weekStartsOn,
        defaultTimeBlockMinutes: DEFAULT_USER_SETTINGS.planning.defaultTimeBlockMinutes,
        workdayStart: DEFAULT_USER_SETTINGS.planning.workdayStart,
        workdayEnd: DEFAULT_USER_SETTINGS.planning.workdayEnd,

        taskDeadlineReminders: DEFAULT_USER_SETTINGS.notifications.taskDeadlineReminders,
        timeBlockReminders: DEFAULT_USER_SETTINGS.notifications.timeBlockReminders,
        focusCompletionNotifications: DEFAULT_USER_SETTINGS.notifications.focusCompletionNotifications,
        breakCompletionNotifications: DEFAULT_USER_SETTINGS.notifications.breakCompletionNotifications,
        habitReminders: DEFAULT_USER_SETTINGS.notifications.habitReminders,
        dailyPlanningReminder: DEFAULT_USER_SETTINGS.notifications.dailyPlanningReminder,

        overlayEnabled: DEFAULT_USER_SETTINGS.overlay.overlayEnabled,
        overlayOpacity: DEFAULT_USER_SETTINGS.overlay.overlayOpacity,
        overlayCompact: DEFAULT_USER_SETTINGS.overlay.overlayCompact,
        overlayShowCurrentTask: DEFAULT_USER_SETTINGS.overlay.overlayShowCurrentTask,
        overlayShowTimer: DEFAULT_USER_SETTINGS.overlay.overlayShowTimer,
        overlayShowNextBlock: DEFAULT_USER_SETTINGS.overlay.overlayShowNextBlock,
        overlayShowProgress: DEFAULT_USER_SETTINGS.overlay.overlayShowProgress,
        overlayShowUrgentTasks: DEFAULT_USER_SETTINGS.overlay.overlayShowUrgentTasks,
        overlayUrgentTaskCount: DEFAULT_USER_SETTINGS.overlay.overlayUrgentTaskCount,
        overlayShowNotifications: DEFAULT_USER_SETTINGS.overlay.overlayShowNotifications,
        overlayPreset: DEFAULT_USER_SETTINGS.overlay.overlayPreset,
        overlayDensity: DEFAULT_USER_SETTINGS.overlay.overlayDensity,
        overlayBlur: DEFAULT_USER_SETTINGS.overlay.overlayBlur,
        overlayBorder: DEFAULT_USER_SETTINGS.overlay.overlayBorder,
        overlayTimerSize: DEFAULT_USER_SETTINGS.overlay.overlayTimerSize,
        overlayTimerGlow: DEFAULT_USER_SETTINGS.overlay.overlayTimerGlow,
        overlayTimerWeight: DEFAULT_USER_SETTINGS.overlay.overlayTimerWeight,
        launchOnStartup: DEFAULT_USER_SETTINGS.overlay.launchOnStartup,
        launchMinimized: DEFAULT_USER_SETTINGS.overlay.launchMinimized,
        startupMode: DEFAULT_USER_SETTINGS.overlay.startupMode,
      },
    });
  }

  return mapPrismaSettingsToDTO(record);
}

/**
 * Gets user settings for a given userId.
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  return getOrCreateUserSettings(userId);
}

/**
 * Updates partial user settings for a given userId.
 * Performs numeric clamping and partial merging.
 */
export async function updateUserSettings(
  userId: string,
  input: UpdateSettingsInput
): Promise<UserSettings> {
  // Ensure record exists
  await getOrCreateUserSettings(userId);

  // Prepare database update object
  const data: Prisma.UserSettingsUpdateInput = {};

  // Appearance
  if (input.appearance) {
    if (input.appearance.theme !== undefined) data.theme = input.appearance.theme;
    if (input.appearance.accentColor !== undefined) data.accentColor = input.appearance.accentColor;
    if (input.appearance.uiDensity !== undefined) data.uiDensity = input.appearance.uiDensity;
    if (input.appearance.reducedMotion !== undefined) data.reducedMotion = input.appearance.reducedMotion;
  }

  // Focus
  if (input.focus) {
    const limits = FOCUS_NUMERIC_LIMITS;
    if (input.focus.pomodoroMinutes !== undefined) {
      data.pomodoroMinutes = clamp(input.focus.pomodoroMinutes, limits.pomodoroMinutes.min, limits.pomodoroMinutes.max);
    }
    if (input.focus.shortBreakMinutes !== undefined) {
      data.shortBreakMinutes = clamp(input.focus.shortBreakMinutes, limits.shortBreakMinutes.min, limits.shortBreakMinutes.max);
    }
    if (input.focus.longBreakMinutes !== undefined) {
      data.longBreakMinutes = clamp(input.focus.longBreakMinutes, limits.longBreakMinutes.min, limits.longBreakMinutes.max);
    }
    if (input.focus.pomodoroCycles !== undefined) {
      data.pomodoroCycles = clamp(input.focus.pomodoroCycles, limits.pomodoroCycles.min, limits.pomodoroCycles.max);
    }
    if (input.focus.autoStartBreaks !== undefined) data.autoStartBreaks = input.focus.autoStartBreaks;
    if (input.focus.autoStartWork !== undefined) data.autoStartWork = input.focus.autoStartWork;
    if (input.focus.soundEnabled !== undefined) data.soundEnabled = input.focus.soundEnabled;
    if (input.focus.soundVolume !== undefined) {
      data.soundVolume = clamp(input.focus.soundVolume, limits.soundVolume.min, limits.soundVolume.max);
    }
    if (input.focus.soundTheme !== undefined) data.soundTheme = input.focus.soundTheme;
  }

  // Planning
  if (input.planning) {
    if (input.planning.defaultCalendarView !== undefined) data.defaultCalendarView = input.planning.defaultCalendarView;
    if (input.planning.weekStartsOn !== undefined) data.weekStartsOn = input.planning.weekStartsOn;
    if (input.planning.defaultTimeBlockMinutes !== undefined) data.defaultTimeBlockMinutes = input.planning.defaultTimeBlockMinutes;
    if (input.planning.workdayStart !== undefined) data.workdayStart = input.planning.workdayStart;
    if (input.planning.workdayEnd !== undefined) data.workdayEnd = input.planning.workdayEnd;
  }

  // Notifications
  if (input.notifications) {
    if (input.notifications.taskDeadlineReminders !== undefined) data.taskDeadlineReminders = input.notifications.taskDeadlineReminders;
    if (input.notifications.timeBlockReminders !== undefined) data.timeBlockReminders = input.notifications.timeBlockReminders;
    if (input.notifications.focusCompletionNotifications !== undefined) data.focusCompletionNotifications = input.notifications.focusCompletionNotifications;
    if (input.notifications.breakCompletionNotifications !== undefined) data.breakCompletionNotifications = input.notifications.breakCompletionNotifications;
    if (input.notifications.habitReminders !== undefined) data.habitReminders = input.notifications.habitReminders;
    if (input.notifications.dailyPlanningReminder !== undefined) data.dailyPlanningReminder = input.notifications.dailyPlanningReminder;
  }

  // Overlay
  if (input.overlay) {
    if (input.overlay.overlayEnabled !== undefined) data.overlayEnabled = input.overlay.overlayEnabled;
    if (input.overlay.overlayOpacity !== undefined) {
      data.overlayOpacity = clamp(input.overlay.overlayOpacity, FOCUS_NUMERIC_LIMITS.overlayOpacity.min, FOCUS_NUMERIC_LIMITS.overlayOpacity.max);
    }
    if (input.overlay.overlayCompact !== undefined) data.overlayCompact = input.overlay.overlayCompact;
    if (input.overlay.overlayShowCurrentTask !== undefined) data.overlayShowCurrentTask = input.overlay.overlayShowCurrentTask;
    if (input.overlay.overlayShowTimer !== undefined) data.overlayShowTimer = input.overlay.overlayShowTimer;
    if (input.overlay.overlayShowNextBlock !== undefined) data.overlayShowNextBlock = input.overlay.overlayShowNextBlock;
    if (input.overlay.overlayShowProgress !== undefined) data.overlayShowProgress = input.overlay.overlayShowProgress;
    if (input.overlay.overlayShowUrgentTasks !== undefined) data.overlayShowUrgentTasks = input.overlay.overlayShowUrgentTasks;
    if (input.overlay.overlayUrgentTaskCount !== undefined) {
      data.overlayUrgentTaskCount = clamp(input.overlay.overlayUrgentTaskCount, 1, 3);
    }
    if (input.overlay.overlayShowNotifications !== undefined) data.overlayShowNotifications = input.overlay.overlayShowNotifications;

    if (input.overlay.overlayPreset !== undefined) data.overlayPreset = input.overlay.overlayPreset;
    if (input.overlay.overlayDensity !== undefined) data.overlayDensity = input.overlay.overlayDensity;
    if (input.overlay.overlayBlur !== undefined) data.overlayBlur = clamp(input.overlay.overlayBlur, 0, 40);
    if (input.overlay.overlayBorder !== undefined) data.overlayBorder = input.overlay.overlayBorder;
    if (input.overlay.overlayTimerSize !== undefined) data.overlayTimerSize = input.overlay.overlayTimerSize;
    if (input.overlay.overlayTimerGlow !== undefined) data.overlayTimerGlow = input.overlay.overlayTimerGlow;
    if (input.overlay.overlayTimerWeight !== undefined) data.overlayTimerWeight = input.overlay.overlayTimerWeight;
    if (input.overlay.launchOnStartup !== undefined) data.launchOnStartup = input.overlay.launchOnStartup;
    if (input.overlay.launchMinimized !== undefined) data.launchMinimized = input.overlay.launchMinimized;
    if (input.overlay.startupMode !== undefined) data.startupMode = input.overlay.startupMode;
  }



  // Custom shortcuts map
  if (input.customShortcuts) {
    data.customShortcuts = input.customShortcuts as unknown as Prisma.InputJsonValue;
  }

  const updated = await prisma.userSettings.update({
    where: { userId },
    data,
  });

  return mapPrismaSettingsToDTO(updated);
}

/**
 * Resets user settings to system defaults for a given userId.
 */
export async function resetUserSettings(userId: string): Promise<UserSettings> {
  const resetData: Prisma.UserSettingsUpdateInput = {
    theme: DEFAULT_USER_SETTINGS.appearance.theme,
    accentColor: DEFAULT_USER_SETTINGS.appearance.accentColor,
    uiDensity: DEFAULT_USER_SETTINGS.appearance.uiDensity,
    reducedMotion: DEFAULT_USER_SETTINGS.appearance.reducedMotion,

    pomodoroMinutes: DEFAULT_USER_SETTINGS.focus.pomodoroMinutes,
    shortBreakMinutes: DEFAULT_USER_SETTINGS.focus.shortBreakMinutes,
    longBreakMinutes: DEFAULT_USER_SETTINGS.focus.longBreakMinutes,
    pomodoroCycles: DEFAULT_USER_SETTINGS.focus.pomodoroCycles,
    autoStartBreaks: DEFAULT_USER_SETTINGS.focus.autoStartBreaks,
    autoStartWork: DEFAULT_USER_SETTINGS.focus.autoStartWork,
    soundEnabled: DEFAULT_USER_SETTINGS.focus.soundEnabled,
    soundVolume: DEFAULT_USER_SETTINGS.focus.soundVolume,
    soundTheme: DEFAULT_USER_SETTINGS.focus.soundTheme,

    defaultCalendarView: DEFAULT_USER_SETTINGS.planning.defaultCalendarView,
    weekStartsOn: DEFAULT_USER_SETTINGS.planning.weekStartsOn,
    defaultTimeBlockMinutes: DEFAULT_USER_SETTINGS.planning.defaultTimeBlockMinutes,
    workdayStart: DEFAULT_USER_SETTINGS.planning.workdayStart,
    workdayEnd: DEFAULT_USER_SETTINGS.planning.workdayEnd,

    taskDeadlineReminders: DEFAULT_USER_SETTINGS.notifications.taskDeadlineReminders,
    timeBlockReminders: DEFAULT_USER_SETTINGS.notifications.timeBlockReminders,
    focusCompletionNotifications: DEFAULT_USER_SETTINGS.notifications.focusCompletionNotifications,
    breakCompletionNotifications: DEFAULT_USER_SETTINGS.notifications.breakCompletionNotifications,
    habitReminders: DEFAULT_USER_SETTINGS.notifications.habitReminders,
    dailyPlanningReminder: DEFAULT_USER_SETTINGS.notifications.dailyPlanningReminder,

    overlayEnabled: DEFAULT_USER_SETTINGS.overlay.overlayEnabled,
    overlayOpacity: DEFAULT_USER_SETTINGS.overlay.overlayOpacity,
    overlayCompact: DEFAULT_USER_SETTINGS.overlay.overlayCompact,
    overlayShowCurrentTask: DEFAULT_USER_SETTINGS.overlay.overlayShowCurrentTask,
    overlayShowTimer: DEFAULT_USER_SETTINGS.overlay.overlayShowTimer,
    overlayShowNextBlock: DEFAULT_USER_SETTINGS.overlay.overlayShowNextBlock,
    overlayShowProgress: DEFAULT_USER_SETTINGS.overlay.overlayShowProgress,

    customShortcuts: Prisma.JsonNull,
  };

  const updated = await prisma.userSettings.upsert({
    where: { userId },
    update: resetData,
    create: {
      userId,
      ...DEFAULT_USER_SETTINGS.appearance,
      ...DEFAULT_USER_SETTINGS.focus,
      ...DEFAULT_USER_SETTINGS.planning,
      ...DEFAULT_USER_SETTINGS.notifications,
      ...DEFAULT_USER_SETTINGS.overlay,
    },
  });

  return mapPrismaSettingsToDTO(updated);
}
