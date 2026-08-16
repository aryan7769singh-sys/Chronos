import { prisma } from "@/lib/prisma";
import type { Notification } from "@prisma/client";
import type {
  CreateNotificationInput,
  NotificationPriority,
  NotificationQueryOptions,
  NotificationRecord,
  NotificationType,
  NotificationChannel,
} from "@/features/notifications/types";
import { getUserSettings } from "@/services/settings.service";

// ---------------------------------------------------------------------------
// Helper DTO Mapper
// ---------------------------------------------------------------------------

function mapDbNotificationToRecord(dbNotif: Notification): NotificationRecord {
  return {
    id: dbNotif.id,
    userId: dbNotif.userId,
    type: dbNotif.type as NotificationType,
    title: dbNotif.title,
    message: dbNotif.message,
    priority: dbNotif.priority as NotificationPriority,
    channel: dbNotif.channel as NotificationChannel,
    entityId: dbNotif.entityId,
    entityType: dbNotif.entityType,
    idempotencyKey: dbNotif.idempotencyKey,
    scheduledFor: dbNotif.scheduledFor.toISOString(),
    deliveredAt: dbNotif.deliveredAt ? dbNotif.deliveredAt.toISOString() : null,
    readAt: dbNotif.readAt ? dbNotif.readAt.toISOString() : null,
    createdAt: dbNotif.createdAt.toISOString(),
  };
}

/**
 * Retrieves notifications for a specific tenant user session.
 */
export async function getNotifications(
  userId: string,
  options?: NotificationQueryOptions
): Promise<NotificationRecord[]> {
  const where: {
    userId: string;
    deletedAt: null;
    readAt?: null;
  } = {
    userId,
    deletedAt: null,
  };

  if (options?.unreadOnly) {
    where.readAt = null;
  }


  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit || 20,
  });

  return notifications.map(mapDbNotificationToRecord);
}

/**
 * Gets the total count of unread notifications for a user session.
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<number> {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
      deletedAt: null,
    },
  });
}

/**
 * Creates a notification with built-in duplicate prevention (idempotency).
 */
export async function createNotification(
  userId: string,
  input: CreateNotificationInput
): Promise<NotificationRecord | null> {
  const {
    type,
    title,
    message,
    priority = "normal",
    channel = "desktop",
    entityId,
    entityType,
    idempotencyKey,
    scheduledFor,
  } = input;

  // Check user settings before creating notification
  const userSettings = await getUserSettings(userId);
  const prefs = userSettings.notifications;

  let isEnabled = true;
  switch (type) {
    case "task_deadline":
      isEnabled = prefs.taskDeadlineReminders;
      break;
    case "time_block_upcoming":
    case "time_block_started":
    case "time_block_completed":
      isEnabled = prefs.timeBlockReminders;
      break;
    case "focus_completed":
      isEnabled = prefs.focusCompletionNotifications;
      break;
    case "break_completed":
      isEnabled = prefs.breakCompletionNotifications;
      break;
    case "habit_reminder":
      isEnabled = prefs.habitReminders;
      break;
    case "daily_planning":
      isEnabled = prefs.dailyPlanningReminder;
      break;
  }

  if (!isEnabled) {
    return null;
  }

  // Idempotency check: avoid duplicate notifications
  if (idempotencyKey) {
    const existing = await prisma.notification.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return mapDbNotificationToRecord(existing);
    }
  }

  const dateScheduled = scheduledFor
    ? typeof scheduledFor === "string"
      ? new Date(scheduledFor)
      : scheduledFor
    : new Date();

  try {
    const created = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        priority,
        channel,
        entityId: entityId || null,
        entityType: entityType || null,
        idempotencyKey: idempotencyKey || null,
        scheduledFor: dateScheduled,
        deliveredAt: new Date(),
      },
    });

    return mapDbNotificationToRecord(created);
  } catch (error: unknown) {
    // Unique constraint on idempotencyKey violation handling
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002" &&
      idempotencyKey
    ) {
      const existing = await prisma.notification.findUnique({
        where: { idempotencyKey },
      });
      if (existing) return mapDbNotificationToRecord(existing);
    }
    throw error;
  }

}

/**
 * Marks a specific notification as read for a tenant user.
 */
export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<NotificationRecord> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
      deletedAt: null,
    },
  });

  if (!notification) {
    throw new Error("Notification not found or access denied.");
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  return mapDbNotificationToRecord(updated);
}

/**
 * Marks all unread notifications as read for a tenant user.
 */
export async function markAllNotificationsRead(
  userId: string
): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
      deletedAt: null,
    },
    data: { readAt: new Date() },
  });

  return { count: result.count };
}

/**
 * Soft-deletes a notification for a tenant user.
 */
export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<boolean> {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
      deletedAt: null,
    },
  });

  if (!notification) {
    return false;
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { deletedAt: new Date() },
  });

  return true;
}
