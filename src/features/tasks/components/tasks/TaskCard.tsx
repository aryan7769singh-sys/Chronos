import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_CLASSES,
  PRIORITY_DOT_CLASSES,
  PRIORITY_LABEL,
} from "../../constants/domain";
import { MOCK_SUBTASKS } from "../../constants/mockData";
import type { Task } from "../../types";

interface TaskCardProps {
  task: Task;
  projectId: string;
}

export function TaskCard({ task, projectId }: TaskCardProps) {
  const subtasks = MOCK_SUBTASKS.filter((s) => s.taskId === task.id);
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const hasSubtasks = subtasks.length > 0;

  const isOverdue =
    task.status !== "done" &&
    task.status !== "cancelled" &&
    new Date(task.deadline) < new Date();

  return (
    <Link
      href={`/projects/${projectId}/${task.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-lg"
    >
      <div className="flex items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-muted/50">
        {/* Priority dot */}
        <span
          className={cn(
            "mt-1 size-2 shrink-0 rounded-full",
            PRIORITY_DOT_CLASSES[task.priority]
          )}
          aria-label={`${PRIORITY_LABEL[task.priority]} priority`}
        />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium leading-snug text-foreground group-hover:text-foreground",
                task.status === "done" && "line-through text-muted-foreground",
                task.status === "cancelled" && "line-through text-muted-foreground opacity-60"
              )}
            >
              {task.title}
            </p>

            {/* Status chip */}
            <span
              className={cn(
                "shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium",
                TASK_STATUS_CLASSES[task.status]
              )}
            >
              {TASK_STATUS_LABEL[task.status]}
            </span>
          </div>

          {/* Footer: subtasks + deadline */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {hasSubtasks && (
              <span className="flex items-center gap-1">
                <Layers className="size-3" />
                {completedSubtasks}/{subtasks.length}
              </span>
            )}
            <span
              className={cn(
                "flex items-center gap-1",
                isOverdue && "text-destructive"
              )}
            >
              <CalendarDays className="size-3 shrink-0" />
              {isOverdue
                ? "Overdue"
                : formatDistanceToNow(new Date(task.deadline), {
                    addSuffix: true,
                  })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
