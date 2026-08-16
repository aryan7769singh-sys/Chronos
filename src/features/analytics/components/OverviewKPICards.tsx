"use client";

import {
  Clock,
  CheckCircle2,
  Repeat,
  Target,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { OverviewKPIs } from "../types";

interface OverviewKPICardsProps {
  kpis: OverviewKPIs;
  timeRange: string;
}

export function OverviewKPICards({ kpis }: OverviewKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Focus Time */}
      <StatCard
        title="Total Deep Work"
        value={kpis.totalFocusMinutes.formattedCurrent}
        icon={Clock}
        tone="violet"
        trend={
          kpis.totalFocusMinutes.changePercent !== null
            ? {
                value:
                  kpis.totalFocusMinutes.changePercent > 0
                    ? `+${kpis.totalFocusMinutes.changePercent}%`
                    : `${kpis.totalFocusMinutes.changePercent}%`,
                direction: kpis.totalFocusMinutes.trend,
              }
            : undefined
        }
        subtitle="vs previous period"
      />

      {/* 2. Tasks Completed */}
      <StatCard
        title="Tasks Completed"
        value={kpis.completedTasks.formattedCurrent}
        icon={CheckCircle2}
        tone="emerald"
        trend={
          kpis.completedTasks.changePercent !== null
            ? {
                value:
                  kpis.completedTasks.changePercent > 0
                    ? `+${kpis.completedTasks.changePercent}%`
                    : `${kpis.completedTasks.changePercent}%`,
                direction: kpis.completedTasks.trend,
              }
            : undefined
        }
        subtitle="closed in period"
      />

      {/* 3. Habit Adherence Rate */}
      <StatCard
        title="Habit Consistency"
        value={kpis.habitAdherenceRate.formattedCurrent}
        icon={Repeat}
        tone="cyan"
        trend={
          kpis.habitAdherenceRate.changePercent !== null
            ? {
                value:
                  kpis.habitAdherenceRate.changePercent > 0
                    ? `+${kpis.habitAdherenceRate.changePercent}%`
                    : `${kpis.habitAdherenceRate.changePercent}%`,
                direction: kpis.habitAdherenceRate.trend,
              }
            : undefined
        }
        subtitle="overall adherence"
      />

      {/* 4. Estimation Accuracy (Actual vs Estimated Time) */}
      <StatCard
        title="Estimation Accuracy"
        value={kpis.estimationAccuracy.formattedCurrent}
        icon={Target}
        tone="amber"
        trend={
          kpis.estimationAccuracy.changePercent !== null
            ? {
                value:
                  kpis.estimationAccuracy.changePercent > 0
                    ? `+${kpis.estimationAccuracy.changePercent}%`
                    : `${kpis.estimationAccuracy.changePercent}%`,
                direction: kpis.estimationAccuracy.trend,
              }
            : undefined
        }
        subtitle="actual vs estimated"
      />
    </div>
  );
}
