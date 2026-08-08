"use client";

import { Repeat, Flame, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaTrendChart, type AreaDataPoint } from "./charts/AreaTrendChart";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import type { AnalyticsData } from "../types";
import { cn } from "@/lib/utils";

interface HabitConsistencySectionProps {
  habits: AnalyticsData["habits"];
}

export function HabitConsistencySection({ habits }: HabitConsistencySectionProps) {
  const trendData: AreaDataPoint[] = habits.dailyTrend.map((d) => ({
    label: d.label,
    value: d.adherencePercent,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* Primary: Habit Adherence Trendline */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Repeat className="size-4 text-cyan-500" />
            <span>Habit Adherence Trend</span>
          </CardTitle>
          <span className="text-xs font-mono font-semibold text-foreground">
            {habits.overallAdherenceRate}% Overall
          </span>
        </CardHeader>

        <CardContent className="p-4 pt-2 space-y-4">
          <AreaTrendChart
            data={trendData}
            height={190}
            strokeColor="#06b6d4" // cyan-500
            valueFormatter={(v) => `${v}% Adherence`}
            emptyMessage="No habit check-ins in this date range"
          />

          {/* Category Adherence Pills */}
          {habits.byCategory.length > 0 && (
            <div className="pt-3 border-t border-border/40 space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                Category Consistency
              </span>
              <div className="flex flex-wrap gap-2">
                {habits.byCategory.map((cat) => (
                  <div
                    key={cat.category}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 border border-border/50 text-xs"
                  >
                    <span className="font-medium text-foreground">{cat.category}</span>
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                      {cat.adherencePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary: Top Habit Streaks */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Award className="size-4 text-amber-500" />
            <span>Streak Leaders</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {habits.topHabits.length > 0 ? (
            <div className="divide-y divide-border/40">
              {habits.topHabits.slice(0, 5).map((h) => {
                const colorStyles =
                  PROJECT_COLOR_STYLES[h.color] || PROJECT_COLOR_STYLES.violet;

                return (
                  <div key={h.habitId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "size-7 rounded-md flex items-center justify-center shrink-0 border",
                          colorStyles.badge
                        )}
                      >
                        <ProjectIcon iconName={h.icon} className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{h.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {h.completionRate}% period adherence
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 font-mono font-bold text-amber-600 dark:text-amber-400">
                      <Flame className="size-3.5 fill-current" />
                      <span>{h.currentStreak}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No habits created yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
