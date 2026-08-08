"use client";

import { CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { SimpleBarChart, type BarChartDataPoint } from "./charts/SimpleBarChart";
import type { AnalyticsData } from "../types";
import { cn } from "@/lib/utils";

interface TaskVelocitySectionProps {
  tasks: AnalyticsData["tasks"];
}

const PRIORITY_BADGES = {
  urgent: "text-destructive bg-destructive/10 border-destructive/20",
  high: "text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20",
  medium: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-muted-foreground bg-muted border-border/50",
};

export function TaskVelocitySection({ tasks }: TaskVelocitySectionProps) {
  const chartData: BarChartDataPoint[] = tasks.velocityTrend.map((d) => ({
    label: d.label,
    value: d.completedTasks,
    secondaryValue: d.createdTasks,
    tooltipText: `${d.completedTasks} completed / ${d.createdTasks} created`,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Primary: Task Velocity Trend */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Task Completion Velocity</span>
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-emerald-500" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-violet-500" />
              <span>Created</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          <SimpleBarChart
            data={chartData}
            height={190}
            barColor="#10b981"
            secondaryBarColor="#8b5cf6"
            valueFormatter={(v) => `${v} tasks`}
            emptyMessage="No task activity in this date range"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span>
              Total Created: <strong className="text-foreground">{tasks.totalCreated}</strong>
            </span>
            <span>
              Total Completed: <strong className="text-foreground">{tasks.totalCompleted}</strong>
            </span>
            <span>
              Completion Rate:{" "}
              <strong className="text-foreground">
                {tasks.completionRate !== null ? `${tasks.completionRate}%` : "No new tasks"}
              </strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Secondary: Priority Breakdown & Overdue Status */}
      <div className="space-y-6">
        {/* Priority Completion Rate */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="size-4 text-muted-foreground" />
              <span>Completion by Priority</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {tasks.byPriority.map((p) => (
              <div key={p.priority} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[10px] font-semibold border uppercase tracking-wider",
                      PRIORITY_BADGES[p.priority]
                    )}
                  >
                    {p.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    <strong className="text-foreground">{p.completedCount}</strong> / {p.totalCount} ({p.percentage}%)
                  </span>
                </div>
                <Progress value={p.percentage} className="h-1.5">
                  <ProgressLabel className="sr-only">{p.label} priority completion</ProgressLabel>
                  <ProgressValue className="sr-only">{p.percentage}%</ProgressValue>
                </Progress>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Task Health Summary Card */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className={cn("size-4", tasks.overdueCount > 0 ? "text-destructive" : "text-emerald-500")} />
                <span>Overdue Tasks</span>
              </div>
              <span className={cn("font-mono font-bold text-sm", tasks.overdueCount > 0 ? "text-destructive" : "text-foreground")}>
                {tasks.overdueCount}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {tasks.overdueCount === 0
                ? "All active project tasks are within their scheduled deadlines."
                : `${tasks.overdueCount} active task(s) require immediate attention or deadline rescheduling.`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
