import {
  startOfWeek,
  addDays,
  format,
  isToday as checkIsToday,
  subDays,
} from "date-fns";
import type { WeekDayInfo, HabitWithLogs } from "../types";
import type { LogDateItem } from "./streak";

/**
 * Returns array of 7 days for the current week starting on Monday (weekStartsOn: 1).
 */
export function getWeekDays(referenceDate: Date = new Date()): WeekDayInfo[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });

  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    const dateStr = format(day, "yyyy-MM-dd");
    return {
      dateStr,
      dayName: format(day, "EEE"), // Mon, Tue, Wed, ...
      dayNumber: day.getDate(),
      isToday: checkIsToday(day),
    };
  });
}

/**
 * Computes percentage completion from completed vs total counts.
 */
export function calculateCompletionRate(
  completed: number,
  total: number
): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((completed / total) * 100)));
}

/**
 * Calculates consistency rate for a habit over the last N days.
 */
export function calculateHabitConsistency(
  logs: LogDateItem[],
  daysCount: number = 30,
  referenceDate: Date = new Date()
): number {
  if (daysCount <= 0 || !logs) return 0;

  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  let completedDays = 0;
  for (let i = 0; i < daysCount; i++) {
    const d = format(subDays(referenceDate, i), "yyyy-MM-dd");
    if (completedDates.has(d)) {
      completedDays++;
    }
  }

  return Math.round((completedDays / daysCount) * 100);
}

/**
 * Computes day-by-day aggregate completion count across all habits for the given 7 days.
 */
export function getWeeklyDayCompletions(
  habits: HabitWithLogs[],
  weekDays: WeekDayInfo[]
): { dateStr: string; completedCount: number; totalCount: number; percent: number }[] {
  const total = habits.length;

  return weekDays.map((day) => {
    const completedCount = habits.filter((habit) =>
      habit.logs.some((l) => l.date === day.dateStr && l.completed)
    ).length;

    return {
      dateStr: day.dateStr,
      completedCount,
      totalCount: total,
      percent: calculateCompletionRate(completedCount, total),
    };
  });
}
