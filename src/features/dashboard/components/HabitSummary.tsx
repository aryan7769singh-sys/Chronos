import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { getHabitIcon } from "@/features/habits/constants/domain";
import type { HabitSummaryItem } from "@/features/habits/types";

interface HabitSummaryProps {
  habits?: HabitSummaryItem[];
}

export function HabitSummary({ habits = [] }: HabitSummaryProps) {
  const completedCount = habits.filter((h) => h.completedToday).length;
  const total = habits.length;
  const progressPercent =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">Habits</CardTitle>
            <span className="inline-flex items-center justify-center rounded-full bg-muted/80 px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground border border-border/60">
              {completedCount}/{total} today
            </span>
          </div>
          <Link
            href="/habits"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {habits.length > 0 ? (
          /* Habit grid — 2 per row */
          <div className="grid grid-cols-2 gap-2">
            {habits.map((habit) => {
              const Icon = getHabitIcon(habit.icon);
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors border",
                    habit.completedToday
                      ? "bg-primary/10 border-primary/25"
                      : "bg-muted/40 border-border/40"
                  )}
                >
                  {/* Completion indicator */}
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      habit.completedToday
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-muted-foreground"
                    )}
                    aria-label={
                      habit.completedToday ? "Completed" : "Not completed"
                    }
                  >
                    <Icon className="size-3.5" strokeWidth={2} />
                  </span>

                  {/* Label + streak */}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-xs font-medium leading-none truncate",
                        habit.completedToday
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {habit.label}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground font-medium">
                      🔥 {habit.streak}d streak
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center space-y-1.5">
            <p className="text-xs text-muted-foreground">
              No active habits tracked yet.
            </p>
            <Link
              href="/habits"
              className="inline-block text-xs font-medium text-primary hover:underline"
            >
              Start tracking habits →
            </Link>
          </div>
        )}

        {/* Overall progress */}
        <div className="space-y-1.5 pt-1">
          <Progress value={progressPercent} className="h-1.5">
            <ProgressLabel className="sr-only">Daily habit progress</ProgressLabel>
            <ProgressValue className="sr-only">{progressPercent}%</ProgressValue>
          </Progress>
        </div>
      </CardContent>
    </Card>
  );
}
