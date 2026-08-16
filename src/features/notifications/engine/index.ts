import { format, addMinutes, subMinutes, isToday, isTomorrow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/services/notification.service";
import type { NotificationRecord } from "../types";

/**
 * Runs proactive productivity evaluation for the authenticated user.
 * Generates idempotent notifications for upcoming TimeBlocks, task deadlines,
 * habit reminders, and daily planning prompts.
 */
export async function checkProactiveNotifications(
  userId: string
): Promise<NotificationRecord[]> {
  const generated: NotificationRecord[] = [];
  const now = new Date();
  const todayStr = format(now, "yyyy-MM-dd");

  // -------------------------------------------------------------------------
  // 1. TimeBlock Reminders (Upcoming & Started)
  // -------------------------------------------------------------------------
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const todaysBlocks = await prisma.timeBlock.findMany({
    where: {
      userId,
      deletedAt: null,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      task: true,
      project: true,
    },
  });

  for (const block of todaysBlocks) {
    const blockStart = new Date(block.startTime);
    const fifteenMinsBefore = subMinutes(blockStart, 15);

    // Upcoming reminder (within 15 minutes before start)
    if (now >= fifteenMinsBefore && now < blockStart && block.status === "scheduled") {
      const idempotencyKey = `${userId}_tb_upcoming_${block.id}_${blockStart.toISOString()}`;
      const notif = await createNotification(userId, {
        type: "time_block_upcoming",
        title: "Upcoming TimeBlock",
        message: `"${block.title}" starts in less than 15 minutes (${format(blockStart, "h:mm a")}).`,
        priority: "normal",
        entityId: block.id,
        entityType: "time_block",
        idempotencyKey,
        scheduledFor: blockStart,
      });
      if (notif) generated.push(notif);
    }

    // Started notification (if within 10 minutes past start time)
    const tenMinsAfter = addMinutes(blockStart, 10);
    if (now >= blockStart && now <= tenMinsAfter && block.status === "scheduled") {
      const idempotencyKey = `${userId}_tb_started_${block.id}_${blockStart.toISOString()}`;
      const notif = await createNotification(userId, {
        type: "time_block_started",
        title: "TimeBlock Started",
        message: `It's time for "${block.title}". Click to launch focus session.`,
        priority: "high",
        entityId: block.id,
        entityType: "time_block",
        idempotencyKey,
        scheduledFor: blockStart,
      });
      if (notif) generated.push(notif);
    }
  }

  // -------------------------------------------------------------------------
  // 2. Task Deadline Reminders
  // -------------------------------------------------------------------------
  const upcomingTasks = await prisma.task.findMany({
    where: {
      project: { userId },
      deletedAt: null,
      status: { not: "done" },
      deadline: {
        gte: startOfDay,
        lte: addMinutes(endOfDay, 24 * 60), // Today and tomorrow
      },
    },
  });

  for (const task of upcomingTasks) {
    if (!task.deadline) continue;
    const deadline = new Date(task.deadline);
    const isDueToday = isToday(deadline);
    const isDueTomorrow = isTomorrow(deadline);

    if (isDueToday || isDueTomorrow) {
      const idempotencyKey = `${userId}_task_dl_${task.id}_${todayStr}`;
      const notif = await createNotification(userId, {
        type: "task_deadline",
        title: isDueToday ? "Task Due Today" : "Task Due Tomorrow",
        message: `"${task.title}" is due ${isDueToday ? "today" : "tomorrow"}.`,
        priority: isDueToday ? "high" : "normal",
        entityId: task.id,
        entityType: "task",
        idempotencyKey,
        scheduledFor: deadline,
      });
      if (notif) generated.push(notif);
    }
  }

  // -------------------------------------------------------------------------
  // 3. Habit Reminders
  // -------------------------------------------------------------------------
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      deletedAt: null,
      archived: false,
    },
    include: {
      logs: {
        where: {
          date: todayStr,
          completed: true,
        },
      },
    },
  });

  for (const habit of habits) {
    // Only remind if not completed today and past 12:00 PM
    if (habit.logs.length === 0 && now.getHours() >= 12) {
      const idempotencyKey = `${userId}_habit_rem_${habit.id}_${todayStr}`;
      const notif = await createNotification(userId, {
        type: "habit_reminder",
        title: "Habit Reminder",
        message: `Don't forget to complete your habit: "${habit.title}".`,
        priority: "low",
        entityId: habit.id,
        entityType: "habit",
        idempotencyKey,
        scheduledFor: now,
      });
      if (notif) generated.push(notif);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Daily Planning Reminder
  // -------------------------------------------------------------------------
  if (now.getHours() >= 9) {
    const idempotencyKey = `${userId}_daily_plan_${todayStr}`;
    const notif = await createNotification(userId, {
      type: "daily_planning",
      title: "Daily Planning Prompt",
      message: "Start your day with clarity — plan your TimeBlocks and priority tasks.",
      priority: "low",
      entityId: null,
      entityType: "planning",
      idempotencyKey,
      scheduledFor: now,
    });
    if (notif) generated.push(notif);
  }

  return generated;
}
