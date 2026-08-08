"use client";

import { Clock, Flame, CheckCircle2, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
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
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Flame className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Today&apos;s Focus
                </p>
                <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-none mt-0.5">
                  {summary.todayFocusMinutes}m
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    / {summary.dailyGoalMinutes}m goal
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground font-medium">
                Sessions
              </span>
              <p className="text-lg font-bold text-foreground font-mono tabular-nums leading-none mt-0.5">
                {summary.todayCompletedSessions}
              </p>
            </div>
          </div>

          {/* Daily Goal Progress */}
          <div className="space-y-1">
            <Progress value={goalProgress} className="h-1.5">
              <ProgressLabel className="sr-only">Daily focus goal</ProgressLabel>
              <ProgressValue className="sr-only">{goalProgress}%</ProgressValue>
            </Progress>
          </div>
        </CardContent>
      </Card>

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
            <div className="py-8 text-center text-muted-foreground space-y-1">
              <Clock className="size-5 mx-auto text-muted-foreground/60" />
              <p className="text-xs font-medium">No sessions recorded yet</p>
              <p className="text-[11px]">
                Hit &ldquo;Start Focus&rdquo; above to log your first session.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
