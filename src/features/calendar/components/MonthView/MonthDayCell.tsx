"use client";

import { isSameMonth, isToday, format } from "date-fns";
import type { CalendarItem, CalendarEvent } from "../../types";
import { TaskDeadlineBadge } from "../TaskDeadlineBadge";
import { EVENT_COLOR_STYLES, EVENT_TYPE_ICONS } from "../../constants/calendar";
import { cn } from "@/lib/utils";

interface MonthDayCellProps {
  day: Date;
  currentDate: Date;
  items: CalendarItem[];
  onEventClick: (event: CalendarEvent) => void;
  onDayClick: (day: Date) => void;
}

const MAX_VISIBLE_ITEMS = 3;

export function MonthDayCell({
  day,
  currentDate,
  items,
  onEventClick,
  onDayClick,
}: MonthDayCellProps) {
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isCurrentDay = isToday(day);

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const overflowCount = items.length - MAX_VISIBLE_ITEMS;

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

        {isCurrentDay && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Today
          </span>
        )}
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

        {overflowCount > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium pl-1 mt-auto">
            +{overflowCount} more
          </span>
        )}
      </div>
    </div>
  );
}
