"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  CalendarClock,
  Flame,
  Sparkles,
  Timer,
  X,
  AlertTriangle,
  CheckCheck,
} from "lucide-react";
import type { NotificationRecord } from "../types";
import { openChronosRoute } from "@/features/overlay/utils/navigation";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: NotificationRecord;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: NotificationItemProps) {
  const isUnread = !notification.readAt;

  // Determine Icon & Color based on notification type
  let Icon = Bell;
  let iconColor = "text-violet-400 bg-violet-500/20 border-violet-500/30";

  switch (notification.type) {
    case "time_block_upcoming":
    case "time_block_started":
    case "time_block_completed":
      Icon = CalendarClock;
      iconColor = "text-blue-400 bg-blue-500/20 border-blue-500/30";
      break;
    case "focus_completed":
    case "break_completed":
      Icon = Timer;
      iconColor = "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      break;
    case "task_deadline":
      Icon = AlertTriangle;
      iconColor = "text-amber-400 bg-amber-500/20 border-amber-500/30";
      break;
    case "habit_reminder":
      Icon = Flame;
      iconColor = "text-orange-400 bg-orange-500/20 border-orange-500/30";
      break;
    case "daily_planning":
      Icon = Sparkles;
      iconColor = "text-purple-400 bg-purple-500/20 border-purple-500/30";
      break;
  }

  // Determine navigation target
  let targetUrl: string | null = null;
  if (notification.entityType === "time_block") targetUrl = "/calendar";
  else if (notification.entityType === "task") targetUrl = "/tasks";
  else if (notification.entityType === "habit") targetUrl = "/habits";
  else if (notification.entityType === "planning") targetUrl = "/calendar";

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    // If clicking action buttons, return
    if ((e.target as HTMLElement).closest("button")) return;

    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (targetUrl) {
      openChronosRoute(targetUrl);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      className={cn(
        "p-2.5 rounded-xl border transition-all space-y-1 text-xs relative group cursor-pointer select-none",
        isUnread
          ? "bg-slate-900/90 border-violet-500/30 text-slate-100 shadow-sm"
          : "bg-slate-900/40 border-white/5 text-slate-400 opacity-75 hover:opacity-100"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Icon Badge */}
          <div
            className={cn(
              "size-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
              iconColor
            )}
          >
            <Icon className="size-3" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              {/* Unread purple dot indicator */}
              {isUnread && (
                <span
                  className="size-2 rounded-full bg-violet-400 shrink-0 animate-pulse"
                  aria-label="Unread notification"
                />
              )}
              <h4 className={cn("text-xs font-semibold truncate", isUnread ? "text-white" : "text-slate-300")}>
                {notification.title}
              </h4>
              {notification.priority === "high" && (
                <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 px-1 py-0.2 rounded border border-amber-500/30 shrink-0">
                  High
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-300/90 leading-snug">
              {notification.message}
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
              <span>{timeAgo}</span>

              {targetUrl && (
                <>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isUnread) onMarkRead(notification.id);
                      if (targetUrl) openChronosRoute(targetUrl);
                    }}
                    className="font-semibold text-violet-400 hover:text-violet-300 hover:underline cursor-pointer"
                  >
                    View Details
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {isUnread && (
            <button
              id={`notif-mark-read-${notification.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              className="size-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-violet-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Mark as read"
            >
              <CheckCheck className="size-3" />
            </button>
          )}

          <button
            id={`notif-delete-${notification.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="size-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
            title="Delete notification"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
