"use client";

import { isSameMonth, isToday, format, parseISO, isSameDay } from "date-fns";
import type { CalendarItem, CalendarEvent } from "../../types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { TaskDeadlineBadge } from "../TaskDeadlineBadge";
import { EVENT_COLOR_STYLES, EVENT_TYPE_ICONS } from "../../constants/calendar";
import { Timer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthDayCellProps {
  day: Date;
  currentDate: Date;
  items: CalendarItem[];
  timeBlocks?: TimeBlockWithRelations[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeBlockClick?: (block: TimeBlockWithRelations) => void;
  onDayClick: (day: Date) => void;
}

const MAX_VISIBLE_ITEMS = 2;

export function MonthDayCell({
  day,
  currentDate,
  items,
  timeBlocks = [],
  onEventClick,
  onTimeBlockClick,
  onDayClick,
}: MonthDayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);

  // Filter time blocks for this day
  const dayBlocks = timeBlocks.filter((b) => {
    try {
      return isSameDay(parseISO(b.startTime), day);
    } catch {
      return false;
    }
  });

  const completedBlockCount = dayBlocks.filter((b) => b.status === "completed").length;

  // Merge and show limited items (calendar events first, then deadline badges)
  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const overflowCount = items.length - MAX_VISIBLE_ITEMS + dayBlocks.length;

  return (
    <div
      onClick={() => onDayClick(day)}
      className={cn(
        "min-h-28 md:min-h-32 p-1.5 flex flex-col border-b border-r border-border/50 transition-colors group cursor-pointer",
        isCurrentMonth ? "bg-card/40 hover:bg-muted/30" : "bg-muted/10 opacity-50",
        isCurrentDay && "bg-violet-500/5 dark:bg-violet-500/10"
      )}
    >
      {/* Day Number Header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-xs font-semibold size-6 rounded-full flex items-center justify-center transition-colors",
            isCurrentDay
              ? "bg-primary text-primary-foreground font-bold"
              : isCurrentMonth
              ? "text-foreground group-hover:text-foreground"
              : "text-muted-foreground"
          )}
        >
          {format(day, "d")}
        </span>

        <div className="flex items-center gap-1">
          {isCurrentDay && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Today
            </span>
          )}
          {/* TimeBlock count indicator */}
          {dayBlocks.length > 0 && (
            <span
              className="flex items-center gap-0.5 text-[9px] font-semibold text-muted-foreground"
              title={`${dayBlocks.length} time block${dayBlocks.length !== 1 ? "s" : ""}, ${completedBlockCount} completed`}
            >
              <Timer className="size-2.5" />
              {dayBlocks.length}
              {completedBlockCount > 0 && (
                <CheckCircle2 className="size-2.5 text-emerald-500" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Items List */}
      <div className="flex flex-col gap-1 overflow-hidden flex-1">
        {visibleItems.map((item, idx) => {
          if (item.kind === "task_deadline") {
            return (
              <TaskDeadlineBadge
                key={`task-${item.data.taskId}-${idx}`}
                task={item.data}
              />
            );
          }

          const event = item.data;
          const colorStyle =
            EVENT_COLOR_STYLES[event.color] ?? EVENT_COLOR_STYLES.violet;
          const Icon = EVENT_TYPE_ICONS[event.type];

          return (
            <div
              key={`event-${event.id}-${idx}`}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
              }}
              title={`${event.title} (${event.allDay ? "All Day" : format(new Date(event.startDate), "h:mm a")})`}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border truncate transition-all shadow-2xs hover:brightness-110",
                colorStyle.pill
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span className="truncate">{event.title}</span>
              {!event.allDay && (
                <span className="text-[9px] opacity-75 shrink-0 tabular-nums">
                  {format(new Date(event.startDate), "h:mma")}
                </span>
              )}
            </div>
          );
        })}

        {/* Time Blocks (compact, up to 1 shown, rest in count) */}
        {dayBlocks.slice(0, Math.max(0, MAX_VISIBLE_ITEMS - visibleItems.length)).map((block) => (
          <div
            key={`tb-${block.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onTimeBlockClick?.(block);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border truncate bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20 hover:brightness-110 cursor-pointer"
          >
            <Timer className="size-2.5 shrink-0" />
            <span className="truncate">{block.title}</span>
          </div>
        ))}

        {overflowCount > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium pl-1 mt-auto">
            +{overflowCount} more
          </span>
        )}
      </div>
    </div>
  );
}
