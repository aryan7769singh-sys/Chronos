import {
  Dumbbell,
  BookOpen,
  Code2,
  Droplets,
  Moon,
  Apple,
  CheckSquare,
  Repeat2,
  Timer,
  FileText,
} from "lucide-react";
import type { Task, FocusTask, Habit, Deadline, QuickAction } from "../types";

// ---------------------------------------------------------------------------
// Focus Task
// ---------------------------------------------------------------------------

export const MOCK_FOCUS_TASK: FocusTask = {
  id: "focus-1",
  title: "Build Dashboard UI Components",
  nextStep: "Implement the HabitSummary card with progress ring",
  estimatedMinutes: 45,
  progressPercent: 62,
  priority: "high",
};

// ---------------------------------------------------------------------------
// Today's Tasks
// ---------------------------------------------------------------------------

export const MOCK_TODAYS_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Review pull request for auth module",
    completed: true,
    priority: "high",
    dueDate: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Write unit tests for API handlers",
    completed: false,
    priority: "high",
    dueDate: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Update project README with setup instructions",
    completed: false,
    priority: "medium",
  },
  {
    id: "task-4",
    title: "Design system: finalize color tokens",
    completed: false,
    priority: "medium",
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
  },
  {
    id: "task-5",
    title: "Schedule team retrospective meeting",
    completed: false,
    priority: "low",
  },
];

// ---------------------------------------------------------------------------
// Upcoming Deadlines
// ---------------------------------------------------------------------------

export const MOCK_DEADLINES: Deadline[] = [
  {
    id: "dl-1",
    title: "Submit project proposal",
    dueDate: new Date(Date.now() + 3 * 3600000).toISOString(), // 3 hours
    category: "Work",
  },
  {
    id: "dl-2",
    title: "Complete TypeScript course module",
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    category: "Learning",
  },
  {
    id: "dl-3",
    title: "Push feature branch to GitHub",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), // in 2 days
    category: "Dev",
  },
  {
    id: "dl-4",
    title: "Monthly expense report",
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), // in 5 days
    category: "Finance",
  },
];

// ---------------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------------

export const MOCK_HABITS: Habit[] = [
  {
    id: "habit-1",
    label: "Code Practice",
    icon: Code2,
    completedToday: true,
    streak: 14,
  },
  {
    id: "habit-2",
    label: "Read",
    icon: BookOpen,
    completedToday: true,
    streak: 7,
  },
  {
    id: "habit-3",
    label: "Exercise",
    icon: Dumbbell,
    completedToday: false,
    streak: 5,
  },
  {
    id: "habit-4",
    label: "Drink Water",
    icon: Droplets,
    completedToday: true,
    streak: 21,
  },
  {
    id: "habit-5",
    label: "Sleep 8hrs",
    icon: Moon,
    completedToday: false,
    streak: 3,
  },
  {
    id: "habit-6",
    label: "Eat Healthy",
    icon: Apple,
    completedToday: false,
    streak: 2,
  },
];

// ---------------------------------------------------------------------------
// Dashboard meta
// ---------------------------------------------------------------------------

/** Current streak in days (mock) */
export const MOCK_STREAK = 14;

/** Today's productivity recommendation (mock) */
export const MOCK_RECOMMENDATION =
  "You're most productive between 9–11 AM. Schedule your hardest task in that window.";

/** Total focus time today in minutes (mock) */
export const MOCK_FOCUS_MINUTES_TODAY = 80;

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

export const MOCK_QUICK_ACTIONS: QuickAction[] = [
  { id: "qa-1", label: "New Task", icon: CheckSquare, href: "/tasks" },
  { id: "qa-2", label: "New Habit", icon: Repeat2, href: "/habits" },
  { id: "qa-3", label: "Start Focus", icon: Timer, href: "/focus" },
  { id: "qa-4", label: "New Note", icon: FileText, href: "/notes" },
];
