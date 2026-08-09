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
import { startOfDay, endOfDay } from "date-fns";
import { getUserSettings } from "@/services/settings.service";
import { getTodaysFocusTask, getFocusSummary } from "@/services/focus.service";
import { getTodaysTimeBlocks } from "@/services/planning.service";
import type {
  OverlayHUDData,
  OverlayDeadlineInfo,
} from "@/features/overlay/types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";

/**
 * Returns complete HUD data for the specified user.
 * Strictly tenant-isolated by userId.
 */
export async function getOverlayHUDData(userId: string): Promise<OverlayHUDData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // Execute queries in parallel
  const [
    userSettings,
    activeFocusTask,
    todaysBlocks,
    focusSummary,
    completedTasksCountToday,
    rawUpcomingDeadline,
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
  ]);

  // Resolve current active time block & next upcoming block
  let currentBlock: TimeBlockWithRelations | null = null;
  let nextBlock: TimeBlockWithRelations | null = null;

  const nowMs = now.getTime();
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

  return {
    userSettings,
    activeFocusTask,
    currentBlock,
    nextBlock,
    upcomingDeadline,
    focusSummary,
    completedTasksCountToday,
  };
}
