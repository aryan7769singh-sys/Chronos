"use client";

import { Clock, Flame, CheckCircle2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDistanceToNow, parseISO } from "date-fns";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import { TIMER_MODE_COLORS, TIMER_MODE_LABELS } from "../constants/timer";
import type { FocusSession, FocusSummary } from "../types";
import { cn } from "@/lib/utils";

interface FocusSessionHistoryProps {
  sessions: FocusSession[];
  summary: FocusSummary;
}

export function FocusSessionHistory({
  sessions,
  summary,
}: FocusSessionHistoryProps) {
  const goalProgress = Math.min(
    100,
    Math.round((summary.todayFocusMinutes / summary.dailyGoalMinutes) * 100)
  );

  return (
    <div className="space-y-4 w-full">
      {/* Overview Stat Card */}
      <StatCard
        title="Today's Focus"
        value={`${summary.todayFocusMinutes}m`}
        icon={Flame}
        tone="primary"
        subtitle={`Goal: ${summary.dailyGoalMinutes}m • ${summary.todayCompletedSessions} sessions`}
        progress={goalProgress}
      />

      {/* Recent Sessions List */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            <span>Today&apos;s Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {sessions.length > 0 ? (
            <div className="divide-y divide-border/40">
              {sessions.map((sess) => {
                const modeColor =
                  TIMER_MODE_COLORS[sess.mode] || TIMER_MODE_COLORS.pomodoro;
                const projectColors = sess.project
                  ? PROJECT_COLOR_STYLES[sess.project.color] ||
                    PROJECT_COLOR_STYLES.violet
                  : null;
                const durationMinutes = Math.round(sess.duration / 60);

                return (
                  <div
                    key={sess.id}
                    className="py-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded border",
                              modeColor.badge
                            )}
                          >
                            {TIMER_MODE_LABELS[sess.mode]}
                          </span>

                          {sess.project && projectColors && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.2 rounded border",
                                projectColors.badge
                              )}
                            >
                              <ProjectIcon
                                iconName={sess.project.icon}
                                className="size-2.5"
                              />
                              <span className="truncate max-w-[90px]">
                                {sess.project.name}
                              </span>
                            </span>
                          )}
                        </div>

                        {sess.task ? (
                          <p className="font-semibold text-foreground truncate">
                            {sess.task.title}
                          </p>
                        ) : (
                          <p className="text-muted-foreground">General Focus</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-semibold text-foreground">
                        {durationMinutes}m
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(parseISO(sess.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No sessions recorded yet"
              description="Hit 'Start Focus' above to log your first session."
              className="py-6"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
