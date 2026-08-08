"use client";

import {
  Clock,
  CheckCircle2,
  Repeat,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { OverviewKPIs, KPIMetric } from "../types";
import { cn } from "@/lib/utils";

interface OverviewKPICardsProps {
  kpis: OverviewKPIs;
  timeRange: string;
}

interface KPICardProps {
  title: string;
  metric: KPIMetric;
  icon: typeof Clock;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
}

function KPICard({ title, metric, icon: Icon, iconColor, iconBg, subtitle }: KPICardProps) {
  const isUp = metric.trend === "up";
  const isDown = metric.trend === "down";

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
          <div className={cn("size-8 rounded-lg flex items-center justify-center", iconBg, iconColor)}>
            <Icon className="size-4" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-2xl font-bold font-mono text-foreground tabular-nums tracking-tight">
            {metric.formattedCurrent}
          </p>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {metric.changePercent !== null ? (
              <div
                className={cn(
                  "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.2 rounded text-[10px]",
                  isUp && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                  isDown && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                  metric.trend === "neutral" && "bg-muted text-muted-foreground"
                )}
              >
                {isUp ? (
                  <TrendingUp className="size-3" />
                ) : isDown ? (
                  <TrendingDown className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                <span>
                  {metric.changePercent > 0 ? `+${metric.changePercent}%` : `${metric.changePercent}%`}
                </span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.2 rounded font-medium">
                Baseline
              </span>
            )}
            <span className="truncate">{subtitle || "vs previous period"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewKPICards({ kpis }: OverviewKPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Focus Time */}
      <KPICard
        title="Total Deep Work"
        metric={kpis.totalFocusMinutes}
        icon={Clock}
        iconColor="text-violet-600 dark:text-violet-400"
        iconBg="bg-violet-500/10"
        subtitle="vs previous period"
      />

      {/* 2. Tasks Completed */}
      <KPICard
        title="Tasks Completed"
        metric={kpis.completedTasks}
        icon={CheckCircle2}
        iconColor="text-emerald-600 dark:text-emerald-400"
        iconBg="bg-emerald-500/10"
        subtitle="closed in period"
      />

      {/* 3. Habit Adherence Rate */}
      <KPICard
        title="Habit Consistency"
        metric={kpis.habitAdherenceRate}
        icon={Repeat}
        iconColor="text-cyan-600 dark:text-cyan-400"
        iconBg="bg-cyan-500/10"
        subtitle="overall adherence"
      />

      {/* 4. Estimation Accuracy (Actual vs Estimated Time) */}
      <KPICard
        title="Estimation Accuracy"
        metric={kpis.estimationAccuracy}
        icon={Target}
        iconColor="text-amber-600 dark:text-amber-400"
        iconBg="bg-amber-500/10"
        subtitle="actual vs estimated"
      />
    </div>
  );
}
