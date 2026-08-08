import type { Project, Task, ProjectHealth } from "../types";

/**
 * Computes project health based on how actual progress compares to the
 * expected progress given the project's timeline.
 *
 * Algorithm (mock-only):
 *   expectedProgress = (elapsedDays / totalDays) * 100
 *   gap = expectedProgress - actualProgress
 *   gap <= 5   → "on-track"
 *   gap <= 20  → "at-risk"
 *   gap >  20  → "off-track"
 *
 * Edge cases:
 *   - Completed projects are always "on-track".
 *   - Cancelled/Archived projects are always "on-track" (neutral).
 *   - If deadline has already passed and progress < 100 → "off-track".
 */
export function calculateProjectHealth(
  project: Project,
  tasks: Task[]
): ProjectHealth {
  if (
    project.status === "completed" ||
    project.status === "archived" ||
    project.status === "cancelled"
  ) {
    return "on-track";
  }

  const now = Date.now();
  const deadline = new Date(project.deadline).getTime();
  const created = new Date(project.createdAt).getTime();
  const totalDays = (deadline - created) / 86400000;
  const elapsedDays = (now - created) / 86400000;

  // Deadline has passed
  if (now > deadline && project.progress < 100) {
    return "off-track";
  }

  if (totalDays <= 0) return "on-track";

  const expectedProgress = Math.min(100, (elapsedDays / totalDays) * 100);
  const actualProgress =
    tasks.length > 0
      ? tasks.reduce((acc, t) => acc + t.progress, 0) / tasks.length
      : project.progress;

  const gap = expectedProgress - actualProgress;

  if (gap <= 5) return "on-track";
  if (gap <= 20) return "at-risk";
  return "off-track";
}
