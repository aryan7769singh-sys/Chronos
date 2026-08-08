import {
  Repeat2,
  Code2,
  BookOpen,
  Dumbbell,
  Droplets,
  Moon,
  Apple,
  Sparkles,
  Brain,
  Heart,
  Coffee,
  Flame,
  Smile,
  Zap,
  Shield,
  Target,
  Sun,
  Footprints,
  Compass,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Icon Registry
// ---------------------------------------------------------------------------

export const HABIT_ICON_MAP: Record<string, LucideIcon> = {
  Repeat2,
  Code2,
  BookOpen,
  Dumbbell,
  Droplets,
  Moon,
  Apple,
  Sparkles,
  Brain,
  Heart,
  Coffee,
  Flame,
  Smile,
  Zap,
  Shield,
  Target,
  Sun,
  Footprints,
  Compass,
  Activity,
};

export const DEFAULT_HABIT_ICON = "Repeat2";

export function getHabitIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Repeat2;
  return HABIT_ICON_MAP[iconName] ?? Repeat2;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const HABIT_CATEGORIES = [
  "General",
  "Productivity",
  "Learning",
  "Health",
  "Fitness",
  "Mindfulness",
] as const;

export type HabitCategory = (typeof HABIT_CATEGORIES)[number];

// ---------------------------------------------------------------------------
// Color Identities (Matching ProjectColor: violet, blue, emerald, amber, red, pink)
// ---------------------------------------------------------------------------

export const HABIT_COLORS: ProjectColor[] = [
  "violet",
  "blue",
  "emerald",
  "amber",
  "red",
  "pink",
];

export const HABIT_COLOR_STYLES: Record<
  ProjectColor,
  {
    badge: string;
    indicator: string;
    bgHover: string;
    glow: string;
    text: string;
  }
> = {
  violet: {
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    indicator: "bg-violet-500 text-white",
    bgHover: "hover:border-violet-500/40",
    glow: "ring-violet-500/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  blue: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    indicator: "bg-blue-500 text-white",
    bgHover: "hover:border-blue-500/40",
    glow: "ring-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    indicator: "bg-emerald-500 text-white",
    bgHover: "hover:border-emerald-500/40",
    glow: "ring-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    indicator: "bg-amber-500 text-white",
    bgHover: "hover:border-amber-500/40",
    glow: "ring-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  red: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    indicator: "bg-red-500 text-white",
    bgHover: "hover:border-red-500/40",
    glow: "ring-red-500/20",
    text: "text-red-600 dark:text-red-400",
  },
  pink: {
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    indicator: "bg-pink-500 text-white",
    bgHover: "hover:border-pink-500/40",
    glow: "ring-pink-500/20",
    text: "text-pink-600 dark:text-pink-400",
  },
};
