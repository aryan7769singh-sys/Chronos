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
import { MOCK_HABITS } from "../constants/mockData";

export function HabitSummary() {
  const completedCount = MOCK_HABITS.filter((h) => h.completedToday).length;
  const total = MOCK_HABITS.length;
  const progressPercent = Math.round((completedCount / total) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Habits</CardTitle>
          <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
            {completedCount}/{total} today
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Habit grid — 2 per row */}
        <div className="grid grid-cols-2 gap-2">
          {MOCK_HABITS.map((habit) => {
            const Icon = habit.icon;
            return (
              <div
                key={habit.id}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors",
                  habit.completedToday
                    ? "bg-primary/8 ring-1 ring-primary/20"
                    : "bg-muted/50"
                )}
              >
                {/* Completion indicator */}
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    habit.completedToday
                      ? "bg-primary text-primary-foreground"
                      : "bg-background ring-1 ring-border text-muted-foreground"
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
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                    🔥 {habit.streak}d streak
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall progress */}
        <Progress value={progressPercent}>
          <ProgressLabel>Daily progress</ProgressLabel>
          <ProgressValue>{progressPercent}%</ProgressValue>
        </Progress>
      </CardContent>
    </Card>
  );
}
