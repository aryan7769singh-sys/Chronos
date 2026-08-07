import type { LucideIcon } from "lucide-react";

export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO date string
};

export type FocusTask = {
  id: string;
  title: string;
  nextStep: string;
  estimatedMinutes: number;
  /** 0–100 */
  progressPercent: number;
  priority: Priority;
};

export type Habit = {
  id: string;
  label: string;
  icon: LucideIcon;
  completedToday: boolean;
  streak: number;
};

export type Deadline = {
  id: string;
  title: string;
  /** ISO date string */
  dueDate: string;
  category: string;
};

export type QuickAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};
