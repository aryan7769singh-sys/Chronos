"use client";

import { getMonthMatrix, getItemsForDay } from "../../utils/dateGrid";
import { isSameDay, parseISO } from "date-fns";
import { MonthDayCell } from "./MonthDayCell";
import type { CalendarItem, CalendarEvent } from "../../types";
import type { TimeBlockWithRelations } from "@/features/planning/types";

interface MonthViewProps {
  currentDate: Date;
  items: CalendarItem[];
  timeBlocks?: TimeBlockWithRelations[];
  onEventClick: (event: CalendarEvent) => void;
  onTimeBlockClick?: (block: TimeBlockWithRelations) => void;
  onDayClick: (day: Date) => void;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({
  currentDate,
  items,
  timeBlocks = [],
  onEventClick,
  onTimeBlockClick,
  onDayClick,
}: MonthViewProps) {
  const days = getMonthMatrix(currentDate);

  return (
    <div className="w-full flex flex-col rounded-xl border border-border/60 bg-card/40 overflow-hidden shadow-xs">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider border-r border-border/40 last:border-r-0"
          >
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{name[0]}</span>
          </div>
        ))}
      </div>

      {/* 7-Column Days Grid */}
      <div className="grid grid-cols-7 border-l border-t border-border/40 bg-background/50">
        {days.map((day) => {
          const dayItems = getItemsForDay(items, day);
          const dayBlocks = timeBlocks.filter((b) => {
            try {
              return isSameDay(parseISO(b.startTime), day);
            } catch {
              return false;
            }
          });
          return (
            <MonthDayCell
              key={day.toISOString()}
              day={day}
              currentDate={currentDate}
              items={dayItems}
              timeBlocks={dayBlocks}
              onEventClick={onEventClick}
              onTimeBlockClick={onTimeBlockClick}
              onDayClick={onDayClick}
            />
          );
        })}
      </div>
    </div>
  );
}
