import type { Task, Subtask } from "../types";

/**
 * Derives project progress (0–100) from the average of its tasks' progress values.
 * Returns 0 for an empty task list.
 */
export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const sum = tasks.reduce((acc, t) => acc + t.progress, 0);
  return Math.round(sum / tasks.length);
}

/**
 * Derives task progress (0–100) from the ratio of completed subtasks.
 * Returns 0 for an empty subtask list.
 */
export function calculateTaskProgress(subtasks: Subtask[]): number {
  if (subtasks.length === 0) return 0;
  const completed = subtasks.filter((s) => s.completed).length;
  return Math.round((completed / subtasks.length) * 100);
}
