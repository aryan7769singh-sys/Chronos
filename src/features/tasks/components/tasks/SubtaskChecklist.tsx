"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import type { Subtask } from "../../types";

interface SubtaskChecklistProps {
  subtasks: Subtask[];
}

export function SubtaskChecklist({ subtasks }: SubtaskChecklistProps) {
  // Local state: track toggled subtask IDs on top of initial completed state
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(
    () => new Set(subtasks.filter((s) => s.completed).map((s) => s.id))
  );

  function toggle(id: string) {
    setLocalCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const completedCount = localCompleted.size;
  const total = subtasks.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Header + progress */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Subtasks</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {completedCount}/{total}
        </span>
      </div>

      {total > 0 && (
        <Progress value={progressPercent}>
          <ProgressLabel className="sr-only">Subtask progress</ProgressLabel>
          <ProgressValue className="sr-only">{progressPercent}%</ProgressValue>
        </Progress>
      )}

      {/* Checklist */}
      {total > 0 ? (
        <ul className="space-y-1" role="list">
          {subtasks.map((subtask) => {
            const isCompleted = localCompleted.has(subtask.id);
            return (
              <li key={subtask.id}>
                <button
                  type="button"
                  id={`subtask-${subtask.id}`}
                  onClick={() => toggle(subtask.id)}
                  aria-pressed={isCompleted}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  {/* Checkbox visual */}
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-all duration-150",
                      isCompleted
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    )}
                    aria-hidden
                  >
                    {isCompleted && (
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

                  <span
                    className={cn(
                      "text-sm leading-snug flex-1",
                      isCompleted
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {subtask.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground px-2">No subtasks added yet.</p>
      )}

      {/* Placeholder "+ Add subtask" row */}
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <Plus className="size-4 shrink-0" />
        Add subtask
      </button>
    </div>
  );
}
