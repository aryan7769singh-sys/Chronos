import type { ProjectColor, Priority } from "@/features/tasks/types";

export type TimerMode =
  | "pomodoro"
  | "short_break"
  | "long_break"
  | "custom"
  | "stopwatch";

export type TimerStatus = "idle" | "running" | "paused";

export type FocusTaskInfo = {
  id: string;
  projectId: string;
  title: string;
  projectName: string;
  projectColor: ProjectColor;
  projectIcon: string;
  priority: Priority;
  currentStep?: string;
  estimatedDuration: number;
  actualDuration: number;
};

export type FocusSession = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  mode: TimerMode;
  duration: number; // in seconds
  targetDuration: number; // in seconds
  completed: boolean;
  notes: string;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    color: ProjectColor;
    icon: string;
  } | null;
  task?: {
    id: string;
    title: string;
    priority: Priority;
  } | null;
};

export type CreateFocusSessionInput = {
  projectId?: string | null;
  taskId?: string | null;
  mode: TimerMode;
  duration: number; // in seconds
  targetDuration: number; // in seconds
  completed?: boolean;
  notes?: string;
};

export type FocusSummary = {
  todayFocusMinutes: number;
  todayCompletedSessions: number;
  dailyGoalMinutes: number;
  currentStreak: number;
};

export type TimerSettings = {
  pomodoroWorkMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosUntilLongBreak: number;
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
};
