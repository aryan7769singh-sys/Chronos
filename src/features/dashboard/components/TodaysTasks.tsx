import { Plus } from "lucide-react";
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
import { MOCK_TODAYS_TASKS } from "../constants/mockData";
import type { Priority } from "../types";

const PRIORITY_DOT: Record<Priority, string> = {
  high: "bg-destructive",
  medium: "bg-amber-500",
  low: "bg-muted-foreground/40",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Med",
  low: "Low",
};

export function TodaysTasks() {
  const tasks = MOCK_TODAYS_TASKS.slice(0, 5);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Today&apos;s Tasks</CardTitle>
          <span className="inline-flex items-center justify-center size-5 rounded-full bg-muted text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
            {completedCount}/{tasks.length}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-1" role="list">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
            >
              {/* Visual checkbox */}
              <span
                role="img"
                aria-label={task.completed ? "Completed" : "Incomplete"}
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                  task.completed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background"
                )}
              >
                {task.completed && (
                  <svg
                    viewBox="0 0 10 8"
                    className="size-2.5 stroke-current"
                    fill="none"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="1 4 3.5 6.5 9 1" />
                  </svg>
                )}
              </span>

              {/* Title */}
              <span
                className={cn(
                  "flex-1 text-sm leading-snug",
                  task.completed && "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </span>

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
          ))}
        </ul>
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
