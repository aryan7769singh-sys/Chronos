// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** 4-level priority system used across projects and tasks. */
export type Priority = "urgent" | "high" | "medium" | "low";

// ---------------------------------------------------------------------------
// Project domain
// ---------------------------------------------------------------------------

export type ProjectStatus =
  | "active"
  | "paused"
  | "completed"
  | "archived"
  | "cancelled";

export type ProjectHealth = "on-track" | "at-risk" | "off-track";

/**
 * Supported accent color keys for projects.
 * All associated Tailwind class names must appear as literals in domain.ts
 * so that the Tailwind v4 scanner detects them.
 */
export type ProjectColor =
  | "violet"
  | "blue"
  | "amber"
  | "emerald"
  | "red"
  | "pink";

export type Project = {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  /**
   * The Lucide icon name (e.g. "Layers", "Globe").
   * Stored as a string so Project objects can safely cross the
   * server → client serialization boundary.
   * Resolved to a component via PROJECT_ICON_MAP in domain.ts.
   */
  icon: string;
  status: ProjectStatus;
  priority: Priority;
  /** ISO date string */
  deadline: string;
  /** 0–100, pre-computed from task completion in mock/service data */
  progress: number;
  health: ProjectHealth;
  /** Total active tasks under this project */
  taskCount?: number;
  /** Completed active tasks under this project */
  completedTaskCount?: number;
  /** ISO date string */
  createdAt: string;
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  color?: ProjectColor;
  icon?: string;
  priority?: Priority;
  deadline?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  color?: ProjectColor;
  icon?: string;
  priority?: Priority;
  status?: ProjectStatus;
  deadline?: string;
};

// ---------------------------------------------------------------------------
// Task domain
// ---------------------------------------------------------------------------

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "blocked"
  | "in-review"
  | "done"
  | "cancelled";

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  /** Estimated duration in minutes */
  estimatedDuration: number;
  /** Actual duration in minutes */
  actualDuration: number;
  /** ISO date string */
  deadline: string;
  /** 0–100, pre-computed from subtask completion in mock/service data */
  progress: number;
  /** The immediate next action to take */
  currentStep: string;
  tags: string[];
  notes: string;
  /** ISO date string */
  createdAt: string;
};

export type TaskWithProject = Task & {
  project: {
    id: string;
    name: string;
    color: ProjectColor;
    icon: string;
  };
  subtaskCount: number;
  completedSubtaskCount: number;
};

// ---------------------------------------------------------------------------
// Subtask domain
// ---------------------------------------------------------------------------

export type Subtask = {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
};

// ---------------------------------------------------------------------------
// Global View & Filter Types
// ---------------------------------------------------------------------------

export type TaskViewMode = "list" | "board" | "project";

export type TaskFilterState = {
  search: string;
  status: TaskStatus | "all";
  priority: Priority | "all";
  projectId: string | "all";
  dueFilter: "all" | "today" | "upcoming" | "overdue";
  viewMode: TaskViewMode;
};

export type TaskStats = {
  total: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  blockedCount: number;
  dueTodayCount: number;
  overdueCount: number;
  urgentCount: number;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  projectId: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: string;
  estimatedDuration?: number;
  currentStep?: string;
  tags?: string[];
  notes?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  projectId?: string;
  priority?: Priority;
  status?: TaskStatus;
  deadline?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  currentStep?: string;
  tags?: string[];
  notes?: string;
};
