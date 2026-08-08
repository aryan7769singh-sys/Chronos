import type { ProjectColor } from "@/features/tasks/types";

export type HabitFrequency = "daily" | "weekly";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  color: ProjectColor;
  icon: string;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitWithLogs extends Habit {
  logs: HabitLog[];
  completedToday: boolean;
  currentStreak: number;
  bestStreak: number;
  completionRate: number; // 0–100 percentage over recent days
}

export interface HabitSummaryItem {
  id: string;
  label: string;
  icon: string;
  completedToday: boolean;
  streak: number;
  color?: ProjectColor;
}

export interface HabitStats {
  totalHabits: number;
  completedTodayCount: number;
  completionRate: number;
  bestStreak: number;
  totalActiveStreaks: number;
  categoryBreakdown: { category: string; count: number }[];
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  category?: string;
  color?: ProjectColor;
  icon?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  category?: string;
  color?: ProjectColor;
  icon?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
  archived?: boolean;
}

export interface WeekDayInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // "Mon", "Tue", etc.
  dayNumber: number; // 1-31
  isToday: boolean;
}
