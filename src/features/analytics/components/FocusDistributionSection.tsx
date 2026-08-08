"use client";

import { Flame, Clock, Sun, Moon, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { SimpleBarChart, type BarChartDataPoint } from "./charts/SimpleBarChart";
import { DonutProgress } from "./charts/DonutProgress";
import type { AnalyticsData } from "../types";

interface FocusDistributionSectionProps {
  focus: AnalyticsData["focus"];
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function FocusDistributionSection({ focus }: FocusDistributionSectionProps) {
  const barChartData: BarChartDataPoint[] = focus.dailyTrend.map((d) => ({
    label: d.label,
    value: d.focusMinutes,
    secondaryValue: d.breakMinutes,
    tooltipText: `${d.focusMinutes}m focus (${d.sessionCount} sessions)`,
  }));

  const donutSegments = focus.byMode.map((m) => ({
    label: m.label,
    value: m.minutes,
    color: m.color,
  }));

  const timeIcons = {
    morning: Sun,
    afternoon: Sparkles,
    evening: Moon,
    night: Clock,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Primary: Daily Focus Time Bar Chart */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="size-4 text-violet-500" />
            <span>Deep Work Distribution</span>
          </CardTitle>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-violet-500" />
              <span>Focus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-xs bg-emerald-500" />
              <span>Breaks</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          <SimpleBarChart
            data={barChartData}
            height={190}
            barColor="#8b5cf6"
            secondaryBarColor="#10b981"
            valueFormatter={formatMinutes}
            emptyMessage="No focus sessions recorded in this date range"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
            <span>
              Total Focus: <strong className="text-foreground">{formatMinutes(focus.totalFocusMinutes)}</strong>
            </span>
            <span>
              Completed Sessions: <strong className="text-foreground">{focus.completedSessionsCount}</strong>
            </span>
            <span>
              Rest / Breaks: <strong className="text-foreground">{formatMinutes(focus.totalBreakMinutes)}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Column: Mode Distribution & Peak Hours */}
      <div className="space-y-6">
        {/* Timer Modes Donut */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Focus Modes</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {focus.byMode.length > 0 && focus.totalFocusMinutes > 0 ? (
              <div className="flex items-center justify-between gap-4">
                <DonutProgress
                  segments={donutSegments}
                  size={120}
                  strokeWidth={12}
                  centerValue={formatMinutes(focus.totalFocusMinutes)}
                  centerLabel="Total"
                />

                {/* Mode Breakdown Legend */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  {focus.byMode.map((m) => (
                    <div key={m.mode} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: m.color }}
                        />
                        <span className="truncate text-muted-foreground">{m.label}</span>
                      </div>
                      <span className="font-mono font-medium text-foreground shrink-0">
                        {m.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No session modes recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time of Day Productivity */}
        <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Time of Day Energy</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-2.5">
            {focus.timeOfDay.map((bucket) => {
              const Icon = timeIcons[bucket.bucket];
              return (
                <div key={bucket.bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="size-3.5 text-foreground/70" />
                      <span>{bucket.label}</span>
                      <span className="text-[10px] text-muted-foreground/60">({bucket.timeRange})</span>
                    </div>
                    <span className="font-mono font-semibold text-foreground">
                      {bucket.percentage}%
                    </span>
                  </div>
                  <Progress value={bucket.percentage} className="h-1">
                    <ProgressLabel className="sr-only">{bucket.label} focus percentage</ProgressLabel>
                    <ProgressValue className="sr-only">{bucket.percentage}%</ProgressValue>
                  </Progress>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
