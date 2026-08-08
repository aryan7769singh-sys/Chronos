"use client";

import { useTransition } from "react";
import { Plus, Check, CheckSquare } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TaskWithProject, Priority } from "@/features/tasks/types";
import { toggleTaskStatusAction } from "@/features/tasks/actions";

const PRIORITY_DOT: Record<Priority, string> = {
  urgent: "bg-destructive",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Med",
  low: "Low",
};

interface TodaysTasksProps {
  tasks?: TaskWithProject[];
}

export function TodaysTasks({ tasks = [] }: TodaysTasksProps) {
  const [isPending, startTransition] = useTransition();

  const displayTasks = tasks.slice(0, 5);
  const completedCount = displayTasks.filter((t) => t.status === "done").length;

  const handleToggle = (taskId: string, projectId: string) => {
    startTransition(async () => {
      try {
        await toggleTaskStatusAction(taskId, undefined, projectId);
      } catch (err) {
        console.error("Failed to toggle task status:", err);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Today&apos;s Tasks</CardTitle>
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
              {completedCount}/{displayTasks.length}
            </span>
          </div>
          <Link
            href="/tasks"
            className="text-[11px] font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {displayTasks.length > 0 ? (
          <ul className="space-y-1" role="list">
            {displayTasks.map((task) => {
              const isDone = task.status === "done";

              return (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                >
                  {/* Interactive status checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggle(task.id, task.projectId)}
                    disabled={isPending}
                    aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-all cursor-pointer",
                      isDone
                        ? "border-emerald-600 bg-emerald-600 text-white dark:bg-emerald-500"
                        : "border-border bg-background hover:border-primary",
                      isPending && "opacity-60"
                    )}
                  >
                    {isDone && (
                      <Check className="size-2.5 stroke-[3]" />
                    )}
                  </button>

                  {/* Title & Link */}
                  <Link
                    href={`/projects/${task.projectId}/${task.id}`}
                    className={cn(
                      "flex-1 text-sm leading-snug truncate transition-colors hover:text-primary",
                      isDone && "text-muted-foreground line-through"
                    )}
                  >
                    {task.title}
                  </Link>

                  {/* Priority indicator */}
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        PRIORITY_DOT[task.priority]
                      )}
                    />
                    <span className="text-[0.65rem] text-muted-foreground font-medium">
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="py-4 text-center">
            <CheckSquare className="size-6 mx-auto text-muted-foreground mb-1.5 opacity-50" />
            <p className="text-xs text-muted-foreground">
              No tasks scheduled for today.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link
          href="/tasks"
          className={buttonVariants({ variant: "outline", size: "sm", className: "w-full gap-1.5" })}
        >
          <Plus className="size-3.5" />
          New Task
        </Link>
      </CardFooter>
    </Card>
  );
}
