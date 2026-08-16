import Link from "next/link";
import { Clock, Play, Sparkles } from "lucide-react";
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
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import type { FocusTaskInfo } from "@/features/timer/types";
import { cn } from "@/lib/utils";

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border/50",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "Urgent Priority",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

interface TodaysFocusProps {
  task?: FocusTaskInfo | null;
}

export function TodaysFocus({ task }: TodaysFocusProps) {
  if (!task) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">Today&apos;s Focus</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-2">
          <Sparkles className="size-6 mx-auto text-muted-foreground/60" />
          <p className="text-sm font-semibold text-foreground">
            No active tasks to focus on
          </p>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Create or select a task in your projects to launch a focused deep work session.
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-1">
          <Link href="/focus" className="w-full">
            <Button variant="outline" className="w-full gap-2 text-xs" size="sm">
              <Play className="size-3.5" />
              <span>Open Focus Timer</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const colorStyles =
    PROJECT_COLOR_STYLES[task.projectColor] || PROJECT_COLOR_STYLES.violet;

  // Calculate progress ratio (actualDuration / estimatedDuration)
  const progressPercent =
    task.estimatedDuration > 0
      ? Math.min(100, Math.round((task.actualDuration / task.estimatedDuration) * 100))
      : 0;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">Today&apos;s Focus</CardTitle>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                colorStyles.badge
              )}
            >
              <ProjectIcon iconName={task.projectIcon} className="size-3" />
              <span className="truncate max-w-[100px]">{task.projectName}</span>
            </span>

            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border uppercase tracking-wider",
                PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.medium
              )}
            >
              {PRIORITY_LABEL[task.priority] || task.priority}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Task title */}
        <p className="text-sm font-semibold leading-snug text-foreground truncate">
          {task.title}
        </p>

        {/* Next step */}
        {task.currentStep ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border/40">
            <span className="font-semibold text-foreground shrink-0">
              Next step:
            </span>
            <span className="truncate">{task.currentStep}</span>
          </div>
        ) : null}

        {/* Time spent vs Estimated */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            <span>
              {task.actualDuration}m spent
              {task.estimatedDuration > 0 && ` / ~${task.estimatedDuration}m est.`}
            </span>
          </div>
          {task.estimatedDuration > 0 && (
            <span className="font-mono text-[11px] font-medium text-foreground">
              {progressPercent}%
            </span>
          )}
        </div>

        {/* Progress bar */}
        {task.estimatedDuration > 0 && (
          <div className="space-y-1">
            <Progress value={progressPercent} className="h-1.5">
              <ProgressLabel className="sr-only">Focus progress</ProgressLabel>
              <ProgressValue className="sr-only">{progressPercent}%</ProgressValue>
            </Progress>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-1">
        <Link href={`/focus?taskId=${task.id}`} className="w-full">
          <Button
            className="w-full gap-2 text-xs font-semibold shadow-xs cursor-pointer"
            size="sm"
          >
            <Play className="size-3.5 fill-current" />
            <span>Start Focus Session</span>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
