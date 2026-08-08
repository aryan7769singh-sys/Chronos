import type { TimerMode, TimerSettings } from "../types";

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  pomodoroWorkMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosUntilLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};

export const TIMER_MODE_LABELS: Record<TimerMode, string> = {
  pomodoro: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
  custom: "Custom Timer",
  stopwatch: "Stopwatch",
};

export const TIMER_MODE_DESCRIPTIONS: Record<TimerMode, string> = {
  pomodoro: "Deep work session with structured rest intervals",
  short_break: "Take a breath, stretch, and relax",
  long_break: "Extended restorative break before your next cycle",
  custom: "Configurable countdown for flexible tasks",
  stopwatch: "Open-ended flow session with count-up timing",
};

export const TIMER_MODE_COLORS: Record<
  TimerMode,
  {
    ring: string;
    text: string;
    bg: string;
    badge: string;
    border: string;
    glow: string;
  }
> = {
  pomodoro: {
    ring: "#8b5cf6", // violet-500
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    badge: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
    border: "border-violet-500/30",
    glow: "rgba(139, 92, 246, 0.25)",
  },
  short_break: {
    ring: "#10b981", // emerald-500
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    border: "border-emerald-500/30",
    glow: "rgba(16, 185, 129, 0.25)",
  },
  long_break: {
    ring: "#06b6d4", // cyan-500
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-500/10",
    badge: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/30",
    glow: "rgba(6, 182, 212, 0.25)",
  },
  custom: {
    ring: "#f59e0b", // amber-500
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    border: "border-amber-500/30",
    glow: "rgba(245, 158, 11, 0.25)",
  },
  stopwatch: {
    ring: "#ec4899", // pink-500
    text: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-500/10",
    badge: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
    border: "border-pink-500/30",
    glow: "rgba(236, 72, 153, 0.25)",
  },
};
