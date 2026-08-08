"use client";

import { useRef, useEffect } from "react";
import { format, isToday, parseISO } from "date-fns";
import { getWeekDays, getItemsForDay } from "../../utils/dateGrid";
import { TaskDeadlineBadge } from "../TaskDeadlineBadge";
import type { CalendarItem, CalendarEvent } from "../../types";
import { EVENT_COLOR_STYLES, EVENT_TYPE_ICONS } from "../../constants/calendar";
import { cn } from "@/lib/utils";

interface WeekViewProps {
  currentDate: Date;
  items: CalendarItem[];
  onEventClick: (event: CalendarEvent) => void;
  onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56; // pixels per hour

export function WeekView({
  currentDate,
  items,
  onEventClick,
  onSlotClick,
}: WeekViewProps) {
  const days = getWeekDays(currentDate);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to 8:00 AM on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div className="w-full flex flex-col rounded-xl border border-border/60 bg-card/40 overflow-hidden shadow-xs">
      {/* ── Day Headers & All-Day Row ── */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/60 bg-muted/25 sticky top-0 z-20">
        {/* Time ruler corner */}
        <div className="p-2 border-r border-border/50 text-[10px] font-semibold text-muted-foreground uppercase flex items-center justify-center">
          Time
        </div>

        {/* 7 Days Headers */}
        {days.map((day) => {
          const isCurrent = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center border-r border-border/40 last:border-r-0 flex flex-col items-center gap-0.5",
                isCurrent && "bg-violet-500/5 dark:bg-violet-500/10"
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "size-7 rounded-full text-xs font-bold flex items-center justify-center",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── All-Day Shelf ── */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/60 bg-muted/15 min-h-12">
        <div className="p-1.5 border-r border-border/50 text-[10px] font-semibold text-muted-foreground flex items-center justify-center">
          All-day
        </div>

        {days.map((day) => {
          const dayItems = getItemsForDay(items, day);
          const allDayEvents = dayItems.filter(
            (i) => i.kind === "event" && i.data.allDay
          );
          const taskDeadlines = dayItems.filter(
            (i) => i.kind === "task_deadline"
          );

          return (
            <div
              key={`allday-${day.toISOString()}`}
              className="p-1 flex flex-col gap-1 border-r border-border/40 last:border-r-0"
            >
              {allDayEvents.map((item, idx) => {
                const event = item.data as CalendarEvent;
                const colorStyle =
                  EVENT_COLOR_STYLES[event.color] ?? EVENT_COLOR_STYLES.violet;
                return (
                  <div
                    key={`all-day-event-${event.id}-${idx}`}
                    onClick={() => onEventClick(event)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer hover:brightness-110",
                      colorStyle.pill
                    )}
                  >
                    {event.title}
                  </div>
                );
              })}

              {taskDeadlines.map((item, idx) => (
                <TaskDeadlineBadge
                  key={`all-day-task-${idx}`}
                  task={item.data}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* ── 24-Hour Time Grid ── */}
      <div
        ref={scrollRef}
        className="max-h-[600px] overflow-y-auto relative grid grid-cols-[60px_repeat(7,1fr)] bg-background/50"
      >
        {/* Hour Labels */}
        <div className="flex flex-col border-r border-border/50 select-none">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="pr-2 pt-1 text-right text-[10px] font-medium text-muted-foreground border-b border-border/30"
            >
              {hour === 0
                ? "12 AM"
                : hour < 12
                ? `${hour} AM`
                : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`}
            </div>
          ))}
        </div>

        {/* 7 Day Columns */}
        {days.map((day) => {
          const dayItems = getItemsForDay(items, day);
          const timedEvents = dayItems.filter(
            (i) => i.kind === "event" && !i.data.allDay
          ) as { kind: "event"; data: CalendarEvent }[];

          return (
            <div
              key={`grid-${day.toISOString()}`}
              className="relative border-r border-border/40 last:border-r-0 select-none"
            >
              {/* Hour Grid Lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  onClick={() => {
                    const slotDate = new Date(day);
                    slotDate.setHours(hour, 0, 0, 0);
                    onSlotClick(slotDate);
                  }}
                  className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                />
              ))}

              {/* Timed Event Cards */}
              {timedEvents.map(({ data: event }) => {
                const start = parseISO(event.startDate);
                const end = parseISO(event.endDate);

                const startMinutes = start.getHours() * 60 + start.getMinutes();
                const endMinutes = end.getHours() * 60 + end.getMinutes();
                const duration = Math.max(endMinutes - startMinutes, 30); // Min 30m display

                const top = (startMinutes / 60) * HOUR_HEIGHT;
                const height = (duration / 60) * HOUR_HEIGHT;

                const colorStyle =
                  EVENT_COLOR_STYLES[event.color] ?? EVENT_COLOR_STYLES.violet;
                const Icon = EVENT_TYPE_ICONS[event.type];

                return (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                    title={`${event.title} (${format(start, "h:mm a")} – ${format(end, "h:mm a")})`}
                    className={cn(
                      "absolute inset-x-1 p-1.5 rounded-md border text-xs font-medium cursor-pointer overflow-hidden z-10 transition-all hover:ring-1 hover:ring-ring shadow-xs",
                      colorStyle.bg,
                      colorStyle.border,
                      "border-l-3"
                    )}
                  >
                    <div className="flex items-center gap-1 font-semibold truncate text-[11px] text-foreground">
                      <Icon className="size-3 shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {format(start, "h:mm a")} – {format(end, "h:mm a")}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
