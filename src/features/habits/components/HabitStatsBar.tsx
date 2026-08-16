"use client";

import { Flame, CheckCircle2, Trophy, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
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
      <StatCard
        title="Today's Progress"
        value={`${completedTodayCount}/${totalHabits}`}
        icon={CheckCircle2}
        tone="primary"
        progress={completionRate}
        subtitle={`${completionRate}% completed`}
      />

      {/* 2. Best Streak */}
      <StatCard
        title="Best Active Streak"
        value={`${bestStreak}d`}
        icon={Flame}
        tone="amber"
        subtitle={
          bestStreak > 0
            ? "Consecutive daily consistency"
            : "Complete habits today to start"
        }
      />

      {/* 3. Total Streaks */}
      <StatCard
        title="Total Streaks"
        value={`${totalActiveStreaks}d`}
        icon={Trophy}
        tone="emerald"
        subtitle={`Across all ${totalHabits} active habits`}
      />

      {/* 4. Active Habits Count */}
      <StatCard
        title="Active Routine"
        value={totalHabits}
        icon={TrendingUp}
        tone="blue"
        subtitle="Daily personal momentum"
      />
    </div>
  );
}
