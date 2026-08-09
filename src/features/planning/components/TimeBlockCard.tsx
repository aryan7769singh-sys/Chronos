"use client";

import { format, parseISO } from "date-fns";
import {
  CheckCircle2,
  SkipForward,
  Play,
  Clock,
  FolderKanban,
  ListTodo,
  Timer,
} from "lucide-react";
import Link from "next/link";
import type { TimeBlockWithRelations, TimeBlockStatus } from "../types";
import { EVENT_COLOR_STYLES } from "@/features/calendar/constants/calendar";
import {
  TIME_BLOCK_STATUS_DOT,
} from "../constants";
import { cn } from "@/lib/utils";

interface TimeBlockCardProps {
  block: TimeBlockWithRelations;
  /** pixels per hour in the host grid */
  hourHeight: number;
  onClick: (block: TimeBlockWithRelations) => void;
  /** compact = week view column, full = day view */
  variant?: "full" | "compact";
}

export function TimeBlockCard({
  block,
  hourHeight,
  onClick,
  variant = "full",
}: TimeBlockCardProps) {
  const start = parseISO(block.startTime);
  const end = parseISO(block.endTime);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = Math.max(endMinutes - startMinutes, 15);

  const top = (startMinutes / 60) * hourHeight;
  const height = (durationMinutes / 60) * hourHeight;

  const colorStyle =
    EVENT_COLOR_STYLES[block.color as keyof typeof EVENT_COLOR_STYLES] ??
    EVENT_COLOR_STYLES.violet;

  const isCompleted = block.status === "completed";
  const isSkipped =
    block.status === "skipped" || block.status === "cancelled";

  return (
    <div
      key={block.id}
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={cn(
        "absolute inset-x-2 rounded-lg border text-xs cursor-pointer z-20 transition-all hover:ring-1 hover:ring-ring shadow-xs flex flex-col overflow-hidden",
        "border-l-4",
        colorStyle.bg,
        colorStyle.border,
        isCompleted && "opacity-70",
        isSkipped && "opacity-50 grayscale"
      )}
      title={`${block.title} (${format(start, "h:mm a")} – ${format(end, "h:mm a")})`}
    >
      {variant === "full" ? (
        <div className="flex flex-col h-full p-2.5 gap-1 justify-between">
          <div>
            {/* Title row */}
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                <Timer className="size-3 shrink-0 text-muted-foreground" />
                <span className="truncate">{block.title}</span>
              </div>
              {/* Status dot */}
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  TIME_BLOCK_STATUS_DOT[block.status as TimeBlockStatus]
                )}
              />
            </div>

            {/* Project / Task */}
            {block.project && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <FolderKanban className="size-2.5 shrink-0" />
                <span className="truncate">{block.project.name}</span>
              </div>
            )}
            {block.task && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ListTodo className="size-2.5 shrink-0" />
                <span className="truncate">{block.task.title}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] text-muted-foreground">
              {format(start, "h:mm")}–{format(end, "h:mm a")} ·{" "}
              {durationMinutes}m
            </span>

            {/* Start Focus shortcut — only task-linked, not completed/skipped */}
            {block.task && !isCompleted && !isSkipped && (
              <Link
                href={`/focus?taskId=${block.task.id}&blockId=${block.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
                title="Start Focus"
              >
                <Play className="size-2.5 fill-current" />
                Focus
              </Link>
            )}
            {isCompleted && (
              <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
            )}
            {isSkipped && (
              <SkipForward className="size-3 text-muted-foreground shrink-0" />
            )}
          </div>
        </div>
      ) : (
        /* compact (week) */
        <div className="p-1.5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-0.5 font-semibold truncate text-[11px] text-foreground">
            <Clock className="size-2.5 shrink-0" />
            <span className="truncate">{block.title}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">
            {format(start, "h:mm")}–{format(end, "h:mm a")}
          </div>
          {isCompleted && (
            <CheckCircle2 className="size-2.5 text-emerald-500 mt-auto self-end" />
          )}
        </div>
      )}
    </div>
  );
}
