"use client";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Total Tasks
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              {total}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TrendingUp className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 2. In Progress */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              In Progress
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              {inProgressCount}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Due Today */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Due Today
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground">
              {dueTodayCount}
            </span>
          </div>
          <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Clock className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Overdue */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Overdue
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-destructive">
                {overdueCount}
              </span>
              {urgentCount > 0 && (
                <span className="text-[10px] text-orange-500 font-medium">
                  ({urgentCount} urgent)
                </span>
              )}
            </div>
          </div>
          <div className="size-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <AlertCircle className="size-4" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Completed */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm col-span-2 sm:col-span-2 lg:col-span-1">
        <CardContent className="p-3.5 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">
              Completed
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {doneCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({completionRate}%)
              </span>
            </div>
          </div>
          <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="size-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
