"use client";

import { ChevronLeft, ChevronRight, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CalendarViewMode } from "../types";
import { CALENDAR_VIEW_MODES } from "../constants/calendar";
import { formatNavigationTitle } from "../utils/dateGrid";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
  onViewChange: (mode: CalendarViewMode) => void;
  onNewEvent: () => void;
  onNewTimeBlock: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onNavigate,
  onToday,
  onViewChange,
  onNewEvent,
  onNewTimeBlock,
}: CalendarHeaderProps) {
  const title = formatNavigationTitle(currentDate, viewMode);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
      {/* Left: Date Navigation & Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground min-w-44">
          {title}
        </h1>

        <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/60">
          <Button
            id="cal-nav-prev"
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("prev")}
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label="Previous period"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Button
            id="cal-nav-today"
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="h-7 px-2 text-xs font-medium text-foreground hover:bg-background/80"
          >
            Today
          </Button>

          <Button
            id="cal-nav-next"
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("next")}
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label="Next period"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Right: View Switcher, + New Time Block & + New Event */}
      <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
        {/* View Mode Toggle Pill */}
        <div className="flex items-center bg-muted/40 p-0.5 rounded-lg border border-border/60">
          {CALENDAR_VIEW_MODES.map((item) => {
            const isActive = viewMode === item.mode;
            return (
              <button
                key={item.mode}
                id={`cal-view-${item.mode}`}
                type="button"
                onClick={() => onViewChange(item.mode)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  isActive
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* New Time Block Button */}
        <Button
          id="cal-new-timeblock-btn"
          size="sm"
          variant="outline"
          onClick={onNewTimeBlock}
          className="h-8 gap-1.5 text-xs font-semibold border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60"
        >
          <Timer className="size-3.5" />
          <span>Time Block</span>
        </Button>

        {/* Create Event Button */}
        <Button
          id="cal-new-event-btn"
          size="sm"
          onClick={onNewEvent}
          className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
        >
          <Plus className="size-3.5" />
          <span>New Event</span>
        </Button>
      </div>
    </div>
  );
}
