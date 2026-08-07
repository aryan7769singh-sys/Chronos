import { Clock, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { MOCK_FOCUS_TASK } from "../constants/mockData";

const PRIORITY_BADGE: Record<string, string> = {
  high: "bg-destructive/10 text-destructive ring-destructive/20 dark:bg-destructive/20",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  low: "bg-muted text-muted-foreground ring-border",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

export function TodaysFocus() {
  const task = MOCK_FOCUS_TASK;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Today&apos;s Focus</CardTitle>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
              PRIORITY_BADGE[task.priority]
            )}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Task title */}
        <p className="text-base font-medium leading-snug text-foreground">
          {task.title}
        </p>

        {/* Next step */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="mt-0.5 shrink-0 font-medium text-foreground/60">
            Next:
          </span>
          <span>{task.nextStep}</span>
        </div>

        {/* Estimated duration */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span>~{task.estimatedMinutes} min estimated</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={task.progressPercent}>
            <ProgressLabel>Progress</ProgressLabel>
            <ProgressValue>{task.progressPercent}%</ProgressValue>
          </Progress>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full gap-2" size="sm">
          <Play className="size-3.5" />
          Resume
        </Button>
      </CardFooter>
    </Card>
  );
}
