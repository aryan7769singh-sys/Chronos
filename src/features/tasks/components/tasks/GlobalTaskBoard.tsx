"use client";

import { useMemo } from "react";
import type { TaskWithProject, TaskStatus } from "../../types";
import { GlobalTaskCard } from "./GlobalTaskCard";
import { cn } from "@/lib/utils";

const BOARD_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: "todo", title: "To Do", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  { id: "in-progress", title: "In Progress", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  { id: "in-review", title: "In Review", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20" },
  { id: "blocked", title: "Blocked", color: "bg-destructive/10 text-destructive border-destructive/20" },
  { id: "done", title: "Done", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
];

interface GlobalTaskBoardProps {
  tasks: TaskWithProject[];
}

export function GlobalTaskBoard({ tasks }: GlobalTaskBoardProps) {
  const groupedTasks = useMemo(() => {
    const map = new Map<TaskStatus, TaskWithProject[]>();
    for (const col of BOARD_COLUMNS) {
      map.set(col.id, []);
    }

    for (const task of tasks) {
      // Map backlog into todo if not explicitly separated
      const key: TaskStatus =
        task.status === "backlog" ? "todo" : task.status === "cancelled" ? "done" : task.status;
      const list = map.get(key) || [];
      list.push(task);
      map.set(key, list);
    }

    return map;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
      {BOARD_COLUMNS.map((col) => {
        const colTasks = groupedTasks.get(col.id) || [];

        return (
          <div
            key={col.id}
            className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 min-h-[400px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-md border",
                    col.color
                  )}
                >
                  {col.title}
                </span>
                <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Column Task Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
              {colTasks.length > 0 ? (
                colTasks.map((task) => (
                  <GlobalTaskCard key={task.id} task={task} />
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 border border-dashed border-border/50 rounded-lg text-[11px] text-muted-foreground text-center">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
