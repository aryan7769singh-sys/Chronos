"use client";

import { Flame, CheckCircle2 } from "lucide-react";
import type { FocusSummary } from "@/features/timer/types";

interface DailyProgressModuleProps {
  summary: FocusSummary;
  completedTasksCountToday: number;
}

export function DailyProgressModule({
  summary,
  completedTasksCountToday,
}: DailyProgressModuleProps) {
  const goal = summary.dailyGoalMinutes || 120;
  const progressPercent = Math.min(
    100,
    Math.round((summary.todayFocusMinutes / goal) * 100)
  );

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm space-y-1.5 select-none text-slate-200">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <Flame className="size-3 text-amber-400" />
          <span>Today&apos;s Deep Work</span>
        </span>
        <span className="font-bold text-white tabular-nums text-xs">
          {summary.todayFocusMinutes}m / {goal}m ({progressPercent}%)
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-500 shadow-sm"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-medium">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="size-2.5 text-emerald-400" />
          <span>{completedTasksCountToday} tasks completed today</span>
        </span>
        <span className="font-mono">{summary.todayCompletedSessions} focus blocks</span>
      </div>
    </div>
  );
}
