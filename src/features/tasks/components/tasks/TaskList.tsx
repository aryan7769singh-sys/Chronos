import { ChevronDown, InboxIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_CLASSES,
  TASK_STATUS_ORDER,
} from "../../constants/domain";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../../types";

interface TaskListProps {
  tasks: Task[];
  projectId: string;
}

// Groups to open by default (highest priority groups shown expanded)
const DEFAULT_OPEN_STATUSES = new Set<TaskStatus>([
  "in-progress",
  "blocked",
  "in-review",
  "todo",
]);

export function TaskList({ tasks, projectId }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="No tasks yet"
        description="Add a task to get started on this project."
        className="py-12"
      />
    );
  }

  // Group tasks by status, maintaining the priority display order
  const grouped = TASK_STATUS_ORDER.reduce<Record<TaskStatus, Task[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<TaskStatus, Task[]>
  );

  return (
    <div className="space-y-2">
      {TASK_STATUS_ORDER.map((status) => {
        const group = grouped[status];
        if (group.length === 0) return null;

        const isDefaultOpen = DEFAULT_OPEN_STATUSES.has(status);

        return (
          <details
            key={status}
            open={isDefaultOpen}
            className="group/details rounded-lg border border-border bg-card overflow-hidden"
          >
            {/* Section header */}
            <summary
              className={cn(
                "flex cursor-pointer list-none items-center gap-2 px-3 py-2.5 select-none",
                "hover:bg-muted/50 transition-colors"
              )}
            >
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform duration-200",
                  "group-open/details:rotate-0 -rotate-90"
                )}
              />
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium",
                  TASK_STATUS_CLASSES[status]
                )}
              >
                {TASK_STATUS_LABEL[status]}
              </span>
              <span className="text-xs text-muted-foreground">
                {group.length}
              </span>
            </summary>

            {/* Task rows */}
            <div className="border-t border-border divide-y divide-border/50">
              {group.map((task) => (
                <TaskCard key={task.id} task={task} projectId={projectId} />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
