import type {
  ThemePreference,
  DensityPreference,
  CalendarViewPreference,
  SoundThemeOption,
  ShortcutItem,
  UserSettings,
} from "../types";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Appearance Constants
// ---------------------------------------------------------------------------

export const THEME_OPTIONS: { value: ThemePreference; label: string; description: string }[] = [
  { value: "system", label: "System", description: "Sync with your operating system preference" },
  { value: "light", label: "Light", description: "Bright, high-contrast daytime interface" },
  { value: "dark", label: "Dark", description: "Sleek, eye-friendly dark interface" },
];

export const ACCENT_COLOR_OPTIONS: { value: ProjectColor; label: string; bgClass: string }[] = [
  { value: "violet", label: "Violet", bgClass: "bg-violet-500" },
  { value: "blue", label: "Blue", bgClass: "bg-blue-500" },
  { value: "emerald", label: "Emerald", bgClass: "bg-emerald-500" },
  { value: "amber", label: "Amber", bgClass: "bg-amber-500" },
  { value: "red", label: "Rose", bgClass: "bg-red-500" },
  { value: "pink", label: "Pink", bgClass: "bg-pink-500" },
];

export const DENSITY_OPTIONS: { value: DensityPreference; label: string; description: string }[] = [
  { value: "comfortable", label: "Comfortable", description: "Standard padding and generous spacing" },
  { value: "compact", label: "Compact", description: "Tighter rows and dense information hierarchy" },
];

// ---------------------------------------------------------------------------
// Planning Constants
// ---------------------------------------------------------------------------

export const CALENDAR_VIEW_OPTIONS: { value: CalendarViewPreference; label: string }[] = [
  { value: "month", label: "Month View" },
  { value: "week", label: "Week View" },
  { value: "day", label: "Day View" },
];

export const WEEK_START_OPTIONS: { value: 0 | 1; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
];

export const TIME_BLOCK_DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes (1 hour)" },
  { value: 90, label: "90 minutes (1.5 hours)" },
  { value: 120, label: "120 minutes (2 hours)" },
];

// ---------------------------------------------------------------------------
// Focus / Sound Constants
// ---------------------------------------------------------------------------

export const SOUND_THEME_OPTIONS: { value: SoundThemeOption; label: string }[] = [
  { value: "chime", label: "Melodic Chime (Default)" },
  { value: "bell", label: "Soft Bell" },
  { value: "digital", label: "Digital Beep" },
  { value: "minimal", label: "Subtle Pop" },
];

export const FOCUS_NUMERIC_LIMITS = {
  pomodoroMinutes: { min: 1, max: 180, default: 25 },
  shortBreakMinutes: { min: 1, max: 60, default: 5 },
  longBreakMinutes: { min: 1, max: 90, default: 15 },
  pomodoroCycles: { min: 1, max: 12, default: 4 },
  soundVolume: { min: 0, max: 100, default: 80 },
  overlayOpacity: { min: 20, max: 100, default: 90 },
};

// ---------------------------------------------------------------------------
// Default Keyboard Shortcuts Registry
// ---------------------------------------------------------------------------

export const DEFAULT_KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  {
    id: "focus_toggle",
    key: "Space",
    label: "Play / Pause Focus",
    description: "Start or pause the active timer session",
    category: "focus",
    editable: true,
  },
  {
    id: "focus_reset",
    key: "R",
    label: "Reset Timer",
    description: "Reset active timer to initial duration",
    category: "focus",
    editable: true,
  },
  {
    id: "focus_zen",
    key: "F",
    label: "Toggle Zen Mode",
    description: "Enter or exit fullscreen distraction-free mode",
    category: "focus",
    editable: true,
  },
  {
    id: "new_task",
    key: "N",
    label: "New Task",
    description: "Open quick creation dialog for a new task",
    category: "creation",
    editable: true,
  },
  {
    id: "new_project",
    key: "P",
    label: "New Project",
    description: "Open creation dialog for a new project",
    category: "creation",
    editable: true,
  },
  {
    id: "new_timeblock",
    key: "T",
    label: "New Time Block",
    description: "Schedule a new focus block on the calendar",
    category: "creation",
    editable: true,
  },
  {
    id: "open_overlay",
    key: "O",
    label: "Open Desktop Overlay",
    description: "Trigger the desktop command overlay",
    category: "overlay",
    editable: true,
  },
  {
    id: "close_overlay",
    key: "Escape",
    label: "Close Overlay / Dialog",
    description: "Close active modal, overlay, or dialog window",
    category: "navigation",
    editable: false,
  },
];

// ---------------------------------------------------------------------------
// Default User Settings Object
// ---------------------------------------------------------------------------

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt"> = {
  appearance: {
    theme: "system",
    accentColor: "violet",
    uiDensity: "comfortable",
    reducedMotion: false,
  },
  focus: {
    pomodoroMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    pomodoroCycles: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    soundVolume: 80,
    soundTheme: "chime",
  },
  planning: {
    defaultCalendarView: "month",
    weekStartsOn: 0,
    defaultTimeBlockMinutes: 60,
    workdayStart: "09:00",
    workdayEnd: "17:00",
  },
  notifications: {
    taskDeadlineReminders: true,
    timeBlockReminders: true,
    focusCompletionNotifications: true,
    breakCompletionNotifications: true,
    habitReminders: true,
    dailyPlanningReminder: true,
  },
  overlay: {
    overlayEnabled: true,
    overlayOpacity: 90,
    overlayCompact: false,
    overlayShowCurrentTask: true,
    overlayShowTimer: true,
    overlayShowNextBlock: true,
    overlayShowProgress: true,
    overlayShowUrgentTasks: true,
    overlayUrgentTaskCount: 3,
    overlayShowNotifications: true,
  },
  shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
};

