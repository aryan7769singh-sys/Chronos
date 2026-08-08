import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react";
import type { CalendarEventType, CalendarViewMode } from "../types";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// View Modes
// ---------------------------------------------------------------------------

export const CALENDAR_VIEW_MODES: { mode: CalendarViewMode; label: string }[] = [
  { mode: "month", label: "Month" },
  { mode: "week", label: "Week" },
  { mode: "day", label: "Day" },
];

// ---------------------------------------------------------------------------
// Event Type Metadata & Icons
// ---------------------------------------------------------------------------

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  event: "Event",
  focus_block: "Focus Block",
  meeting: "Meeting",
  reminder: "Reminder",
};

export const EVENT_TYPE_ICONS: Record<CalendarEventType, LucideIcon> = {
  event: CalendarIcon,
  focus_block: Clock,
  meeting: Users,
  reminder: Bell,
};

export const EVENT_TYPE_BADGE_CLASSES: Record<CalendarEventType, string> = {
  event: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  focus_block: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  meeting: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  reminder: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

// ---------------------------------------------------------------------------
// Event Accent Colors (Tailwind v4 literal classes)
// ---------------------------------------------------------------------------

export const EVENT_COLOR_STYLES: Record<
  ProjectColor,
  {
    bg: string;
    border: string;
    text: string;
    indicator: string;
    pill: string;
  }
> = {
  violet: {
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    border: "border-l-violet-500",
    text: "text-violet-700 dark:text-violet-300",
    indicator: "bg-violet-500",
    pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300 hover:bg-violet-500/25 border-violet-500/30",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    border: "border-l-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    indicator: "bg-blue-500",
    pill: "bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-500/25 border-blue-500/30",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    border: "border-l-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    indicator: "bg-amber-500",
    pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border-amber-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    border: "border-l-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    indicator: "bg-emerald-500",
    pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/30",
  },
  red: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    border: "border-l-red-500",
    text: "text-red-700 dark:text-red-300",
    indicator: "bg-red-500",
    pill: "bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-500/25 border-red-500/30",
  },
  pink: {
    bg: "bg-pink-500/10 dark:bg-pink-500/20",
    border: "border-l-pink-500",
    text: "text-pink-700 dark:text-pink-300",
    indicator: "bg-pink-500",
    pill: "bg-pink-500/15 text-pink-700 dark:text-pink-300 hover:bg-pink-500/25 border-pink-500/30",
  },
};
