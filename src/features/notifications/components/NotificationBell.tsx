"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NotificationRecord } from "../types";
import { NotificationCenter } from "./NotificationCenter";
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
  deleteNotificationAction,
} from "../actions";
import { requestNotificationPermission, showSystemNotification } from "../utils/browser";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const broadcastNotificationUpdate = useCallback((newUnreadCount: number) => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("chronos-notification-broadcast");
        channel.postMessage({
          type: "NOTIFICATION_COUNT_UPDATED",
          unreadCount: newUnreadCount,
        });
        channel.close();
      } catch {
        // ignore
      }
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { items, unreadCount: count } = await getNotificationsAction();
      setNotifications(items);
      setUnreadCount(count);
      broadcastNotificationUpdate(count);

      // Trigger desktop / system notification for high priority unread items
      const latestUnreadHighPriority = items.find(
        (item) => !item.readAt && item.priority === "high"
      );
      if (latestUnreadHighPriority) {
        showSystemNotification(
          latestUnreadHighPriority.title,
          latestUnreadHighPriority.message
        );
      }
    } catch {
      // ignore unauthenticated or network errors gracefully
    }
  }, [broadcastNotificationUpdate]);

  useEffect(() => {
    let mounted = true;
    requestNotificationPermission();

    const load = async () => {
      if (mounted) {
        await fetchNotifications();
      }
    };
    load();

    // Poll every 30 seconds for proactive notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // Listen to cross-window notification updates
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel("chronos-notification-broadcast");
      channel.onmessage = (event) => {
        if (event.data?.type === "NOTIFICATION_COUNT_UPDATED" && typeof event.data.unreadCount === "number") {
          setUnreadCount(event.data.unreadCount);
        }
      };
      return () => channel.close();
    } catch {
      // ignore
    }
  }, []);

  const handleMarkRead = async (id: string) => {
    const updatedNotifs = notifications.map((n) =>
      n.id === id ? { ...n, readAt: new Date().toISOString() } : n
    );
    const newCount = Math.max(0, unreadCount - 1);

    setNotifications(updatedNotifs);
    setUnreadCount(newCount);
    broadcastNotificationUpdate(newCount);

    try {
      await markNotificationReadAction(id);
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    const updatedNotifs = notifications.map((n) => ({
      ...n,
      readAt: new Date().toISOString(),
    }));

    setNotifications(updatedNotifs);
    setUnreadCount(0);
    broadcastNotificationUpdate(0);

    try {
      await markAllNotificationsReadAction();
    } catch {
      fetchNotifications();
    }
  };

  const handleDelete = async (id: string) => {
    const item = notifications.find((n) => n.id === id);
    const updatedNotifs = notifications.filter((n) => n.id !== id);
    const newCount = item && !item.readAt ? Math.max(0, unreadCount - 1) : unreadCount;

    setNotifications(updatedNotifs);
    setUnreadCount(newCount);
    broadcastNotificationUpdate(newCount);

    try {
      await deleteNotificationAction(id);
    } catch {
      fetchNotifications();
    }
  };

  return (
    <div
      className="relative"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <Button
        id="header-notifications"
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground relative cursor-pointer"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-violet-500" />
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50">
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}
