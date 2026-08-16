"use client";

import { useState } from "react";
import { CheckCheck, Sparkles } from "lucide-react";
import type { NotificationRecord } from "../types";
import { NotificationItem } from "./NotificationItem";
import { NotificationEmptyState } from "./NotificationEmptyState";
import { Button } from "@/components/ui/button";

interface NotificationCenterProps {
  notifications: NotificationRecord[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filtered = notifications.filter((item) =>
    filter === "unread" ? !item.readAt : true
  );

  return (
    <div
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      className="w-80 sm:w-96 rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-3.5 space-y-3 text-slate-100 select-none"
    >
      {/* ── Header with Single Authoritative Unread Count & Mark All Read ── */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-400" />
          <h3 className="text-xs font-bold text-white tracking-tight">
            Notifications
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">
            {unreadCount > 0 ? (
              <span className="font-semibold text-violet-300">{unreadCount} unread</span>
            ) : (
              <span className="text-slate-400">All caught up</span>
            )}
          </span>

          {unreadCount > 0 && (
            <Button
              id="notif-mark-all-read-btn"
              size="sm"
              variant="ghost"
              onClick={onMarkAllRead}
              className="h-6 px-2 text-[10px] font-semibold text-violet-300 hover:text-white hover:bg-violet-500/20 gap-1 rounded cursor-pointer"
            >
              <CheckCheck className="size-3" />
              <span>Read all</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg text-xs font-medium border border-white/5">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`flex-1 py-1 text-center rounded-md transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-violet-600/40 text-white font-bold shadow-xs border border-violet-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`flex-1 py-1 text-center rounded-md transition-colors cursor-pointer ${
            filter === "unread"
              ? "bg-violet-600/40 text-white font-bold shadow-xs border border-violet-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* ── List / Empty State ── */}
      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          filtered.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
