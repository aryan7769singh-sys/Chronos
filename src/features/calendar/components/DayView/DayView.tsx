"use client";

import { useRef, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { getItemsForDay } from "../../utils/dateGrid";
import { TaskDeadlineBadge } from "../TaskDeadlineBadge";
import type { CalendarItem, CalendarEvent } from "../../types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { TimeBlockCard } from "@/features/planning/components/TimeBlockCard";
import {
  EVENT_COLOR_STYLES,
  EVENT_TYPE_ICONS,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_BADGE_CLASSES,
} from "../../constants/calendar";
import { Badge } from "@/components/ui/badge";
import { MapPin, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayViewProps {
  currentDate: Date;
  items: CalendarItem[];
  timeBlocks?: TimeBlockWithRelations[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeBlockClick?: (block: TimeBlockWithRelations) => void;
  onSlotClick: (date: Date) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 68; // pixels per hour for comfortable reading

export function DayView({
  currentDate,
  items,
  timeBlocks = [],
  onEventClick,
  onTimeBlockClick,
  onSlotClick,
}: DayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayItems = getItemsForDay(items, currentDate);

  const allDayEvents = dayItems.filter(
    (i) => i.kind === "event" && i.data.allDay
  );
  const taskDeadlines = dayItems.filter((i) => i.kind === "task_deadline");
  const timedEvents = dayItems.filter(
    (i) => i.kind === "event" && !i.data.allDay
  ) as { kind: "event"; data: CalendarEvent }[];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * HOUR_HEIGHT;
    }
  }, []);

  return (
    <div className="w-full flex flex-col rounded-xl border border-border/60 bg-card/40 overflow-hidden shadow-xs">
      {/* ── Day Header & All-Day / Tasks Section ── */}
      <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {timedEvents.length} events · {timeBlocks.length} time blocks · {taskDeadlines.length} deadlines
            </p>
          </div>
        </div>

        {/* All-Day Events & Deadlines Grid */}
        {(allDayEvents.length > 0 || taskDeadlines.length > 0) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {allDayEvents.map((item, idx) => {
              const event = item.data as CalendarEvent;
              const colorStyle =
                EVENT_COLOR_STYLES[event.color] ?? EVENT_COLOR_STYLES.violet;
              return (
                <div
                  key={`day-allday-${event.id}-${idx}`}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border hover:brightness-110",
                    colorStyle.pill
                  )}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    All-Day:
                  </span>
                  <span>{event.title}</span>
                </div>
              );
            })}

            {taskDeadlines.map((item, idx) => (
              <TaskDeadlineBadge
                key={`day-task-deadline-${idx}`}
                task={item.data}
                className="py-1"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── 24-Hour Timeline Grid ── */}
      <div
        ref={scrollRef}
        className="max-h-[620px] overflow-y-auto relative grid grid-cols-[70px_1fr] bg-background/50"
      >
        {/* Hour Labels */}
        <div className="flex flex-col border-r border-border/50 select-none">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              className="pr-2.5 pt-1 text-right text-[11px] font-medium text-muted-foreground border-b border-border/30"
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

        {/* Hour Slots & Positioned Cards */}
        <div className="relative select-none">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: `${HOUR_HEIGHT}px` }}
              onClick={() => {
                const slotDate = new Date(currentDate);
                slotDate.setHours(hour, 0, 0, 0);
                onSlotClick(slotDate);
              }}
              className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
            />
          ))}

          {/* CalendarEvent Cards */}
          {timedEvents.map(({ data: event }) => {
            const start = parseISO(event.startDate);
            const end = parseISO(event.endDate);

            const startMinutes = start.getHours() * 60 + start.getMinutes();
            const endMinutes = end.getHours() * 60 + end.getMinutes();
            const duration = Math.max(endMinutes - startMinutes, 30);

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
                  left: "0",
                  right: "50%",
                }}
                className={cn(
                  "absolute p-2.5 rounded-lg border text-xs cursor-pointer z-10 transition-all hover:ring-1 hover:ring-ring shadow-xs flex flex-col justify-between",
                  colorStyle.bg,
                  colorStyle.border,
                  "border-l-4"
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-foreground truncate">
                      <Icon className="size-3.5 shrink-0" />
                      <span className="truncate">{event.title}</span>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] uppercase tracking-wider font-semibold shrink-0 py-0",
                        EVENT_TYPE_BADGE_CLASSES[event.type]
                      )}
                    >
                      {EVENT_TYPE_LABELS[event.type]}
                    </Badge>
                  </div>

                  {event.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                  <span>
                    {format(start, "h:mm a")} – {format(end, "h:mm a")}
                  </span>

                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate max-w-32">{event.location}</span>
                    </span>
                  )}

                  {event.projectName && (
                    <span className="flex items-center gap-1">
                      <FolderKanban className="size-3 shrink-0" />
                      <span className="truncate max-w-32 font-medium text-foreground">
                        {event.projectName}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* TimeBlock Cards — right half of each slot to avoid overlap with events */}
          {timeBlocks.map((block) => (
            <div
              key={block.id}
              style={{ left: "50%", right: 0, position: "absolute" }}
              className="absolute"
            >
              <TimeBlockCard
                block={block}
                hourHeight={HOUR_HEIGHT}
                onClick={(b) => onTimeBlockClick?.(b)}
                variant="full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
