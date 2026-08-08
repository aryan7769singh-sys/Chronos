"use client";

import { useTransition } from "react";
import { Check, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HABIT_COLOR_STYLES } from "../constants/domain";
import { HabitIcon } from "./HabitIcon";
import type { HabitWithLogs, WeekDayInfo } from "../types";
import { toggleHabitAction } from "../actions";
import { cn } from "@/lib/utils";

interface HabitWeeklyMatrixProps {
  habits: HabitWithLogs[];
  weekDays: WeekDayInfo[];
}

export function HabitWeeklyMatrix({
  habits,
  weekDays,
}: HabitWeeklyMatrixProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (habitId: string, dateStr: string) => {
    startTransition(async () => {
      try {
        await toggleHabitAction(habitId, dateStr);
      } catch (err) {
        console.error("Failed to toggle habit log:", err);
      }
    });
  };

  if (habits.length === 0) {
    return null;
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Weekly Consistency Matrix
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              Current Week
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-violet-600 dark:bg-violet-400" />
              Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground/30" />
              Missed
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[640px] divide-y divide-border/30">
          {/* Table Header: Habit column + 7 days */}
          <div className="grid grid-cols-[1fr_repeat(7,48px)_64px] items-center px-4 py-2.5 bg-muted/20 text-xs font-medium text-muted-foreground">
            <div>Habit</div>
            {weekDays.map((day) => (
              <div
                key={day.dateStr}
                className={cn(
                  "flex flex-col items-center justify-center text-center",
                  day.isToday && "text-foreground font-semibold"
                )}
              >
                <span className="text-[10px] uppercase tracking-wider">
                  {day.dayName}
                </span>
                <span
                  className={cn(
                    "text-xs mt-0.5",
                    day.isToday &&
                      "size-5 rounded-full bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold"
                  )}
                >
                  {day.dayNumber}
                </span>
              </div>
            ))}
            <div className="text-right text-[11px]">Streak</div>
          </div>

          {/* Habit Rows */}
          {habits.map((habit) => {
            const colorStyles =
              HABIT_COLOR_STYLES[habit.color] || HABIT_COLOR_STYLES.violet;

            return (
              <div
                key={habit.id}
                className="grid grid-cols-[1fr_repeat(7,48px)_64px] items-center px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                {/* Habit info */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div
                    className={cn(
                      "size-7 rounded-lg flex items-center justify-center shrink-0 border",
                      colorStyles.badge
                    )}
                  >
                    <HabitIcon iconName={habit.icon} className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {habit.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {habit.category}
                    </p>
                  </div>
                </div>

                {/* 7 Days Bubbles */}
                {weekDays.map((day) => {
                  const log = habit.logs.find((l) => l.date === day.dateStr);
                  const isCompleted = !!log?.completed;

                  return (
                    <div
                      key={day.dateStr}
                      className="flex items-center justify-center"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggle(habit.id, day.dateStr)}
                        disabled={isPending}
                        aria-label={`${habit.title}: ${day.dayName} ${day.dateStr} - ${
                          isCompleted ? "Completed (Click to toggle)" : "Not completed (Click to complete)"
                        }`}
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isCompleted
                            ? cn(
                                colorStyles.indicator,
                                "shadow-xs scale-100"
                              )
                            : "bg-muted/60 text-transparent hover:bg-muted/90 hover:text-muted-foreground ring-1 ring-border/50",
                          day.isToday && !isCompleted && "ring-violet-500/50 ring-2",
                          isPending && "opacity-75"
                        )}
                      >
                        {isCompleted ? (
                          <Check className="size-3 stroke-[2.5]" />
                        ) : (
                          <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                        )}
                      </button>
                    </div>
                  );
                })}

                {/* Streak flame badge */}
                <div className="flex items-center justify-end gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Flame className="size-3.5 fill-amber-500/20" />
                  <span>{habit.currentStreak}d</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
