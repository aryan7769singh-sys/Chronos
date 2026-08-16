/**
 * overlay.service.ts
 *
 * Service layer for Desktop Overlay & Command HUD domain operations.
 * Gathers heads-up data for the overlay HUD in a single parallel fetch.
 * Strictly enforces user tenant isolation (`userId`).
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, isToday, isTomorrow } from "date-fns";
import { getUserSettings } from "@/services/settings.service";
import { getTodaysFocusTask, getFocusSummary } from "@/services/focus.service";
import { getTodaysTimeBlocks } from "@/services/planning.service";
import { getUnreadNotificationCount } from "@/services/notification.service";
import type {
  OverlayHUDData,
  OverlayDeadlineInfo,
  OverlayUrgentTask,
} from "@/features/overlay/types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";

const PRIORITY_WEIGHT: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

/**
 * Returns complete HUD data for the specified user.
 * Strictly tenant-isolated by userId.
 */
export async function getOverlayHUDData(userId: string): Promise<OverlayHUDData> {
  const now = new Date();
  const nowMs = now.getTime();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Execute queries in parallel with tenant isolation
  const [
    userSettings,
    activeFocusTask,
    todaysBlocks,
    focusSummary,
    completedTasksCountToday,
    rawUpcomingDeadline,
    activeTasks,
    unreadNotificationsCount,
  ] = await Promise.all([
    getUserSettings(userId),
    getTodaysFocusTask(userId),
    getTodaysTimeBlocks(userId),
    getFocusSummary(userId),

    // Completed tasks count today
    prisma.task.count({
      where: {
        status: "done",
        deletedAt: null,
        updatedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        project: {
          userId,
          deletedAt: null,
        },
      },
    }),

    // Next upcoming task deadline
    prisma.task.findFirst({
      where: {
        deletedAt: null,
        status: {
          notIn: ["done", "cancelled"],
        },
        project: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    }),

    // All active non-completed tasks for urgent ranking
    prisma.task.findMany({
      where: {
        deletedAt: null,
        status: {
          notIn: ["done", "cancelled"],
        },
        project: {
          userId,
          deletedAt: null,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    }),

    // Unread notifications count
    getUnreadNotificationCount(userId),
  ]);

  // Resolve current active time block & next upcoming block
  let currentBlock: TimeBlockWithRelations | null = null;
  let nextBlock: TimeBlockWithRelations | null = null;

  const sortedBlocks = [...todaysBlocks].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  for (const block of sortedBlocks) {
    const startMs = new Date(block.startTime).getTime();
    const endMs = new Date(block.endTime).getTime();

    if (startMs <= nowMs && nowMs <= endMs && block.status !== "cancelled" && block.status !== "skipped") {
      if (!currentBlock) {
        currentBlock = block;
      }
    } else if (startMs > nowMs && block.status !== "cancelled" && block.status !== "skipped") {
      if (!nextBlock) {
        nextBlock = block;
      }
    }
  }

  // Format upcoming deadline info
  let upcomingDeadline: OverlayDeadlineInfo | null = null;
  if (rawUpcomingDeadline) {
    const deadlineDate = new Date(rawUpcomingDeadline.deadline);
    upcomingDeadline = {
      id: rawUpcomingDeadline.id,
      projectId: rawUpcomingDeadline.projectId,
      title: rawUpcomingDeadline.title,
      deadline: rawUpcomingDeadline.deadline.toISOString(),
      priority: rawUpcomingDeadline.priority as Priority,
      projectName: rawUpcomingDeadline.project.name,
      projectColor: (rawUpcomingDeadline.project.color as ProjectColor) || "violet",
      isOverdue: deadlineDate.getTime() < nowMs,
    };
  }

  // Deterministic Urgent Tasks Ranking:
  // 1. Overdue tasks
  // 2. Tasks due today
  // 3. Tasks due tomorrow
  // 4. Higher priority (urgent > high > medium > low)
  // 5. Earlier deadline ascending
  // 6. Title / ID deterministic tie-breaker
  const mappedTasks: OverlayUrgentTask[] = activeTasks.map((t) => {
    const deadlineDate = t.deadline ? new Date(t.deadline) : null;
    const isOverdue = deadlineDate ? deadlineDate.getTime() < nowMs : false;
    const dueToday = deadlineDate ? isToday(deadlineDate) : false;
    const dueTomorrow = deadlineDate ? isTomorrow(deadlineDate) : false;

    return {
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      priority: t.priority as Priority,
      deadline: t.deadline ? t.deadline.toISOString() : null,
      projectName: t.project.name,
      projectColor: (t.project.color as ProjectColor) || "violet",
      isOverdue,
      isToday: dueToday,
      isTomorrow: dueTomorrow,
    };
  });

  mappedTasks.sort((a, b) => {
    // 1. Overdue first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;

    // 2. Due today second
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;

    // 3. Due tomorrow third
    if (a.isTomorrow && !b.isTomorrow) return -1;
    if (!a.isTomorrow && b.isTomorrow) return 1;

    // 4. Priority tier
    const pA = PRIORITY_WEIGHT[a.priority] || 0;
    const pB = PRIORITY_WEIGHT[b.priority] || 0;
    if (pA !== pB) return pB - pA; // higher priority first

    // 5. Earlier deadline
    if (a.deadline && b.deadline) {
      const diff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (diff !== 0) return diff;
    } else if (a.deadline && !b.deadline) {
      return -1;
    } else if (!a.deadline && b.deadline) {
      return 1;
    }

    // 6. Deterministic tie-breaker
    return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
  });

  // Limit to top 3
  const urgentTasks = mappedTasks.slice(0, 3);

  return {
    userSettings,
    activeFocusTask,
    currentBlock,
    nextBlock,
    urgentTasks,
    upcomingDeadline,
    focusSummary,
    completedTasksCountToday,
    unreadNotificationsCount,
  };
}
