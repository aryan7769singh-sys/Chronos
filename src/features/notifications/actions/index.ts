"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/services/notification.service";
import { checkProactiveNotifications } from "../engine";

function revalidateNotificationRoutes() {
  revalidatePath("/dashboard");
  revalidatePath("/overlay");
  revalidatePath("/settings");
}

/**
 * Server action to fetch tenant notifications and run proactive engine check.
 */
export async function getNotificationsAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to fetch notifications.");
  }

  // Run proactive productivity engine evaluation
  await checkProactiveNotifications(session.user.id);

  const [items, unreadCount] = await Promise.all([
    getNotifications(session.user.id, { limit: 25 }),
    getUnreadNotificationCount(session.user.id),
  ]);

  return { items, unreadCount };
}

/**
 * Server action to mark a specific notification as read.
 */
export async function markNotificationReadAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const updated = await markNotificationRead(session.user.id, notificationId);
  revalidateNotificationRoutes();
  return updated;
}

/**
 * Server action to mark all unread notifications as read.
 */
export async function markAllNotificationsReadAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const result = await markAllNotificationsRead(session.user.id);
  revalidateNotificationRoutes();
  return result;
}

/**
 * Server action to soft-delete a notification.
 */
export async function deleteNotificationAction(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const success = await deleteNotification(session.user.id, notificationId);
  revalidateNotificationRoutes();
  return success;
}
