"use client";

import { Flame, CheckCircle2, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import type { HabitStats } from "../types";

interface HabitStatsBarProps {
  stats: HabitStats;
}

export function HabitStatsBar({ stats }: HabitStatsBarProps) {
  const {
    totalHabits,
    completedTodayCount,
    completionRate,
    bestStreak,
    totalActiveStreaks,
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
      {/* 1. Today's Completion Progress */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Today&apos;s Progress
            </span>
            <div className="size-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {completedTodayCount}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {totalHabits}
                </span>
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {completionRate}%
              </span>
            </div>
            <Progress value={completionRate} className="h-1.5">
              <ProgressLabel className="sr-only">Completion rate</ProgressLabel>
              <ProgressValue className="sr-only">{completionRate}%</ProgressValue>
            </Progress>
          </div>
        </CardContent>
      </Card>

      {/* 2. Best Streak */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Best Active Streak
            </span>
            <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {bestStreak}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                days
              </span>
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {bestStreak > 0
                ? "Consecutive daily consistency"
                : "Complete habits today to start"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Streaks */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Streaks
            </span>
            <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Trophy className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalActiveStreaks}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                days combined
              </span>
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across all {totalHabits} active habits
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Active Habits Count */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Active Routine
            </span>
            <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {totalHabits}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                tracked habits
              </span>
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Daily personal momentum
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
