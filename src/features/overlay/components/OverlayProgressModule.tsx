"use client";

import { Flame, CheckCircle2, Timer } from "lucide-react";
import type { FocusSummary } from "@/features/timer/types";
import { cn } from "@/lib/utils";

interface OverlayProgressModuleProps {
  summary: FocusSummary;
  completedTasksCountToday: number;
}

export function OverlayProgressModule({
  summary,
  completedTasksCountToday,
}: OverlayProgressModuleProps) {
  const { todayFocusMinutes, dailyGoalMinutes, currentStreak } = summary;
  const progressPercent = Math.min(
    100,
    Math.round((todayFocusMinutes / (dailyGoalMinutes || 120)) * 100)
  );

  return (
    <div className="p-3.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xs space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          TODAY&apos;S PRODUCTIVITY
        </span>
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex items-center gap-1 text-amber-500 text-[11px]">
            <Flame className="size-3.5 fill-current" />
            <span>{currentStreak}d Streak</span>
          </span>
        </div>
      </div>

      {/* Deep Work progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Timer className="size-3.5 text-violet-500" />
            <span>Deep Work</span>
          </span>
          <span className="tabular-nums font-bold text-foreground">
            {todayFocusMinutes}m / {dailyGoalMinutes}m
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              progressPercent >= 100
                ? "bg-emerald-500"
                : progressPercent >= 50
                ? "bg-violet-500"
                : "bg-blue-500"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Completed Tasks metric */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
        <span className="text-muted-foreground flex items-center gap-1">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          <span>Tasks Completed Today</span>
        </span>
        <span className="font-bold text-foreground tabular-nums">
          {completedTasksCountToday} task{completedTasksCountToday !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}
