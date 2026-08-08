import { format, subDays, parseISO, differenceInCalendarDays } from "date-fns";

export interface LogDateItem {
  date: string; // YYYY-MM-DD
  completed: boolean;
}

/**
 * Calculates the current active streak in days from an array of habit logs.
 *
 * Rules:
 * - If completed today, counts today + all consecutive preceding days.
 * - If not completed today, but was completed yesterday, the streak is maintained
 *   (counts yesterday + preceding days).
 * - Otherwise streak is 0.
 */
export function calculateCurrentStreak(
  logs: LogDateItem[],
  referenceDate: Date = new Date()
): number {
  if (!logs || logs.length === 0) return 0;

  const completedDates = new Set(
    logs.filter((l) => l.completed).map((l) => l.date)
  );

  const todayStr = format(referenceDate, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(referenceDate, 1), "yyyy-MM-dd");

  let checkDate = referenceDate;
  let streak = 0;

  // If completed today, start counting from today
  if (completedDates.has(todayStr)) {
    while (completedDates.has(format(checkDate, "yyyy-MM-dd"))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
    return streak;
  }

  // If not completed today, check if yesterday was completed
  if (completedDates.has(yesterdayStr)) {
    checkDate = subDays(referenceDate, 1);
    while (completedDates.has(format(checkDate, "yyyy-MM-dd"))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }
    return streak;
  }

  return 0;
}

/**
 * Calculates the all-time longest streak in days from an array of habit logs.
 */
export function calculateLongestStreak(logs: LogDateItem[]): number {
  if (!logs || logs.length === 0) return 0;

  const sortedDates = Array.from(
    new Set(logs.filter((l) => l.completed).map((l) => l.date))
  ).sort();

  if (sortedDates.length === 0) return 0;

  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1]);
    const curr = parseISO(sortedDates[i]);
    const diff = differenceInCalendarDays(curr, prev);

    if (diff === 1) {
      currentRun++;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else if (diff > 1) {
      currentRun = 1;
    }
  }

  return maxStreak;
}

/**
 * Checks whether a habit is completed on a specific ISO date string (YYYY-MM-DD).
 */
export function isCompletedOnDate(
  logs: LogDateItem[],
  dateStr: string
): boolean {
  if (!logs) return false;
  const match = logs.find((l) => l.date === dateStr);
  return !!match?.completed;
}
