import React from "react";
import {
  Layers,
  Globe,
  Package,
  LayoutDashboard,
  Code2,
  BookOpen,
  Rocket,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { ProjectColor, ProjectHealth, ProjectStatus, Priority, TaskStatus } from "../types";

// ---------------------------------------------------------------------------
// Project icon registry
// Maps serializable icon name strings → LucideIcon components.
// Use this on the CLIENT side to resolve project.icon (a string) into a
// renderable component. Never store LucideIcon components in data objects that
// cross the server → client boundary.
// ---------------------------------------------------------------------------

export const PROJECT_ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  Globe,
  Package,
  LayoutDashboard,
  Code2,
  BookOpen,
  Rocket,
  Briefcase,
};

/** Fallback icon when an unknown name is encountered. */
export const FALLBACK_ICON = Layers;

export function getProjectIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Layers;
  return PROJECT_ICON_MAP[iconName] ?? Layers;
}

export function ProjectIcon({
  iconName,
  className,
  strokeWidth = 2,
}: {
  iconName?: string | null;
  className?: string;
  strokeWidth?: number;
}) {
  const IconComp = getProjectIcon(iconName);
  return React.createElement(IconComp, { className, strokeWidth });
}

// ---------------------------------------------------------------------------
// Project color classes
// All Tailwind class names are written as literal strings so the v4 scanner
// detects them at build time. Never construct these dynamically.
// ---------------------------------------------------------------------------

export const PROJECT_COLOR_CLASSES: Record<
  ProjectColor,
  {
    /** Left-border accent — use with border-l-4 */
    border: string;
    /** Icon container background */
    iconBg: string;
    /** Icon foreground color */
    iconText: string;
    /** Subtle background tint for surfaces */
    softBg: string;
  }
> = {
  violet: {
    border: "border-l-violet-500",
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-500",
    softBg: "bg-violet-500/5",
  },
  blue: {
    border: "border-l-blue-500",
    iconBg: "bg-blue-500/15",
    iconText: "text-blue-500",
    softBg: "bg-blue-500/5",
  },
  amber: {
    border: "border-l-amber-500",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-500",
    softBg: "bg-amber-500/5",
  },
  emerald: {
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-500",
    softBg: "bg-emerald-500/5",
  },
  red: {
    border: "border-l-red-500",
    iconBg: "bg-red-500/15",
    iconText: "text-red-500",
    softBg: "bg-red-500/5",
  },
  pink: {
    border: "border-l-pink-500",
    iconBg: "bg-pink-500/15",
    iconText: "text-pink-500",
    softBg: "bg-pink-500/5",
  },
};

export const PROJECT_COLOR_STYLES: Record<
  ProjectColor,
  {
    badge: string;
    border: string;
    iconBg: string;
    iconText: string;
    softBg: string;
  }
> = {
  violet: {
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    border: "border-l-violet-500",
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-500",
    softBg: "bg-violet-500/5",
  },
  blue: {
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    border: "border-l-blue-500",
    iconBg: "bg-blue-500/15",
    iconText: "text-blue-500",
    softBg: "bg-blue-500/5",
  },
  amber: {
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    border: "border-l-amber-500",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-500",
    softBg: "bg-amber-500/5",
  },
  emerald: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    border: "border-l-emerald-500",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-500",
    softBg: "bg-emerald-500/5",
  },
  red: {
    badge: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    border: "border-l-red-500",
    iconBg: "bg-red-500/15",
    iconText: "text-red-500",
    softBg: "bg-red-500/5",
  },
  pink: {
    badge: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    border: "border-l-pink-500",
    iconBg: "bg-pink-500/15",
    iconText: "text-pink-500",
    softBg: "bg-pink-500/5",
  },
};

// ---------------------------------------------------------------------------
// Project status display
// ---------------------------------------------------------------------------

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
  cancelled: "Cancelled",
};

export const PROJECT_STATUS_CLASSES: Record<ProjectStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  paused: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  completed: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  archived: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

// ---------------------------------------------------------------------------
// Project health display
// ---------------------------------------------------------------------------

export const PROJECT_HEALTH_LABEL: Record<ProjectHealth, string> = {
  "on-track": "On Track",
  "at-risk": "At Risk",
  "off-track": "Off Track",
};

export const PROJECT_HEALTH_CLASSES: Record<ProjectHealth, string> = {
  "on-track": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "at-risk": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "off-track": "bg-destructive/10 text-destructive",
};

export const PROJECT_HEALTH_DOT: Record<ProjectHealth, string> = {
  "on-track": "bg-emerald-500",
  "at-risk": "bg-amber-500",
  "off-track": "bg-destructive",
};

// ---------------------------------------------------------------------------
// Task status display
// ---------------------------------------------------------------------------

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  "in-progress": "In Progress",
  blocked: "Blocked",
  "in-review": "In Review",
  done: "Done",
  cancelled: "Cancelled",
};

export const TASK_STATUS_CLASSES: Record<TaskStatus, string> = {
  backlog: "bg-muted text-muted-foreground",
  todo: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "in-progress": "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  blocked: "bg-destructive/10 text-destructive",
  "in-review": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-muted text-muted-foreground line-through",
};

/** Ordered groups for TaskList display (priority order) */
export const TASK_STATUS_ORDER: TaskStatus[] = [
  "in-progress",
  "blocked",
  "in-review",
  "todo",
  "backlog",
  "done",
  "cancelled",
];

// ---------------------------------------------------------------------------
// Priority display
// ---------------------------------------------------------------------------

export const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_DOT_CLASSES: Record<Priority, string> = {
  urgent: "bg-destructive",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

export const PRIORITY_BADGE_CLASSES: Record<Priority, string> = {
  urgent: "bg-destructive/10 text-destructive",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
};
