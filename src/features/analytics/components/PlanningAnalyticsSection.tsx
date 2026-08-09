"use client";

import {
  CalendarClock,
  CheckCircle2,
  SkipForward,
  Target,
  TrendingUp,
  Timer,
} from "lucide-react";
import type { PlanningStats } from "@/features/planning/types";
import { cn } from "@/lib/utils";

interface PlanningAnalyticsSectionProps {
  planning: PlanningStats;
}

function formatMins(m: number): string {
  if (m === 0) return "0m";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

interface StatTileProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function StatTile({ icon: Icon, label, value, sub, accent = "text-violet-500" }: StatTileProps) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("size-3.5", accent)} />
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function PlanningAnalyticsSection({ planning }: PlanningAnalyticsSectionProps) {
  if (!planning.hasData) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-violet-500" />
          <h2 className="text-base font-bold text-foreground">Planning & Time Blocking</h2>
        </div>
        <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-border/60 rounded-xl bg-card/30 gap-3">
          <CalendarClock className="size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No time blocks created in this period. Start planning your work on the{" "}
            <a href="/calendar" className="text-primary hover:underline font-medium">
              Calendar
            </a>{" "}
            to see planning analytics.
          </p>
        </div>
      </section>
    );
  }

  const {
    totalPlannedMinutes,
    totalCompletedMinutes,
    totalSkippedMinutes,
    scheduleCompletionPercentage,
    totalBlocks,
    completedBlocks,
    skippedBlocks,
    plannedBlocks,
    cancelledBlocks,
    avgPlanningAccuracyPercentage,
  } = planning;

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <CalendarClock className="size-5 text-violet-500" />
        <h2 className="text-base font-bold text-foreground">Planning & Time Blocking</h2>
        <span className="ml-2 text-xs text-muted-foreground font-normal">
          {totalBlocks} block{totalBlocks !== 1 ? "s" : ""} scheduled this period
        </span>
      </div>

      {/* Schedule Completion bar */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Schedule Completion</span>
          <span className="text-xl font-bold tabular-nums text-foreground">
            {scheduleCompletionPercentage}%
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              scheduleCompletionPercentage >= 75
                ? "bg-emerald-500"
                : scheduleCompletionPercentage >= 50
                ? "bg-amber-500"
                : "bg-destructive"
            )}
            style={{ width: `${Math.min(scheduleCompletionPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 inline-block" />
            Completed: {completedBlocks} blocks ({formatMins(totalCompletedMinutes)})
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-violet-500 inline-block" />
            Remaining: {plannedBlocks} blocks ({formatMins(totalPlannedMinutes - totalCompletedMinutes)})
          </span>
          {skippedBlocks > 0 && (
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground inline-block" />
              Skipped: {skippedBlocks} ({formatMins(totalSkippedMinutes)})
            </span>
          )}
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          icon={Timer}
          label="Total Planned"
          value={formatMins(totalPlannedMinutes)}
          sub={`${totalBlocks} blocks`}
          accent="text-violet-500"
        />
        <StatTile
          icon={CheckCircle2}
          label="Completed"
          value={formatMins(totalCompletedMinutes)}
          sub={`${completedBlocks} blocks done`}
          accent="text-emerald-500"
        />
        <StatTile
          icon={SkipForward}
          label="Skipped / Cancelled"
          value={String(skippedBlocks + cancelledBlocks)}
          sub={formatMins(totalSkippedMinutes)}
          accent="text-muted-foreground"
        />
        <StatTile
          icon={avgPlanningAccuracyPercentage !== null ? TrendingUp : Target}
          label="Planning Accuracy"
          value={
            avgPlanningAccuracyPercentage !== null
              ? `${avgPlanningAccuracyPercentage}%`
              : "—"
          }
          sub={
            avgPlanningAccuracyPercentage !== null
              ? "Actual vs planned time"
              : "Complete task-linked blocks to see"
          }
          accent="text-blue-500"
        />
      </div>
    </section>
  );
}
