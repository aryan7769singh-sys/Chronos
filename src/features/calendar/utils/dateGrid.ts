import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from "date-fns";
import type { CalendarItem, CalendarViewMode } from "../types";

// ---------------------------------------------------------------------------
// Grid Interval Builders
// ---------------------------------------------------------------------------

/**
 * Returns all 35–42 days representing the full month matrix including
 * leading and trailing days from neighboring months.
 */
export function getMonthMatrix(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * Returns the 7 days of the week containing `date`.
 */
export function getWeekDays(date: Date): Date[] {
  const startDate = startOfWeek(date, { weekStartsOn: 0 });
  const endDate = endOfWeek(date, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: startDate, end: endDate });
}

// ---------------------------------------------------------------------------
// Navigation Helpers
// ---------------------------------------------------------------------------

export function navigateDate(
  current: Date,
  direction: "prev" | "next",
  mode: CalendarViewMode
): Date {
  const step = direction === "next" ? 1 : -1;
  switch (mode) {
    case "month":
      return step > 0 ? addMonths(current, 1) : subMonths(current, 1);
    case "week":
      return step > 0 ? addWeeks(current, 1) : subWeeks(current, 1);
    case "day":
      return step > 0 ? addDays(current, 1) : subDays(current, 1);
  }
}

export function formatNavigationTitle(date: Date, mode: CalendarViewMode): string {
  switch (mode) {
    case "month":
      return format(date, "MMMM yyyy");
    case "week": {
      const days = getWeekDays(date);
      const first = days[0];
      const last = days[6];
      if (isSameMonth(first, last)) {
        return `${format(first, "MMM d")} – ${format(last, "d, yyyy")}`;
      }
      return `${format(first, "MMM d")} – ${format(last, "MMM d, yyyy")}`;
    }
    case "day":
      return format(date, "EEEE, MMMM d, yyyy");
  }
}

// ---------------------------------------------------------------------------
// Filtering & Item Resolution
// ---------------------------------------------------------------------------

/**
 * Filters items for a specific target day.
 */
export function getItemsForDay(items: CalendarItem[], day: Date): CalendarItem[] {
  return items.filter((item) => {
    if (item.kind === "event") {
      const start = parseISO(item.data.startDate);
      const end = parseISO(item.data.endDate);
      return (
        isSameDay(start, day) ||
        isSameDay(end, day) ||
        (day >= start && day <= end)
      );
    }

    if (item.kind === "task_deadline") {
      const deadline = parseISO(item.data.deadline);
      return isSameDay(deadline, day);
    }

    return false;
  });
}

export { isSameDay, isSameMonth, isToday, format };
