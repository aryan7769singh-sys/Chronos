"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

interface NotificationsModuleProps {
  unreadCount: number;
}

export function NotificationsModule({ unreadCount: initialUnreadCount }: NotificationsModuleProps) {
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [prevInitial, setPrevInitial] = useState<number>(initialUnreadCount);

  // Sync state if parent initialUnreadCount prop changes during render
  if (prevInitial !== initialUnreadCount) {
    setPrevInitial(initialUnreadCount);
    setUnreadCount(initialUnreadCount);
  }

  // Listen to cross-window notification updates via BroadcastChannel
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

  return (
    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm select-none text-slate-200">
      <div className="flex items-center gap-2">
        <div className="size-5 rounded-md bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center">
          <Bell className="size-3" />
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {unreadCount > 0 ? (
            <>
              <span className="size-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="font-semibold text-white">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-medium">All caught up</span>
          )}
        </div>
      </div>

      <div style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <NotificationBell />
      </div>
    </div>
  );
}
