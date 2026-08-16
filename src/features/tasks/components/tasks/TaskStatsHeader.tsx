"use client";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import type { TaskStats } from "../../types";

interface TaskStatsHeaderProps {
  stats: TaskStats;
}

export function TaskStatsHeader({ stats }: TaskStatsHeaderProps) {
  const {
    total,
    inProgressCount,
    doneCount,
    dueTodayCount,
    overdueCount,
    urgentCount,
  } = stats;

  const completionRate =
    total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Total Tasks */}
      <StatCard
        title="Total Tasks"
        value={total}
        icon={TrendingUp}
        tone="blue"
      />

      {/* 2. In Progress */}
      <StatCard
        title="In Progress"
        value={inProgressCount}
        icon={Clock}
        tone="amber"
      />

      {/* 3. Due Today */}
      <StatCard
        title="Due Today"
        value={dueTodayCount}
        icon={Clock}
        tone="primary"
      />

      {/* 4. Overdue */}
      <StatCard
        title="Overdue"
        value={overdueCount}
        icon={AlertCircle}
        tone="destructive"
        subtitle={urgentCount > 0 ? `(${urgentCount} urgent)` : undefined}
      />

      {/* 5. Completed */}
      <StatCard
        title="Completed"
        value={doneCount}
        icon={CheckCircle2}
        tone="emerald"
        subtitle={`(${completionRate}%)`}
        className="col-span-2 sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
}
