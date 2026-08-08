"use client";

import { CheckSquare } from "lucide-react";
import type { TaskDeadlineItem } from "../types";
import { PROJECT_COLOR_CLASSES } from "@/features/tasks/constants/domain";
import { cn } from "@/lib/utils";

interface TaskDeadlineBadgeProps {
  task: TaskDeadlineItem;
  className?: string;
}

export function TaskDeadlineBadge({ task, className }: TaskDeadlineBadgeProps) {
  const colorStyle = PROJECT_COLOR_CLASSES[task.color] ?? PROJECT_COLOR_CLASSES.violet;

  return (
    <div
      title={`Task Deadline: ${task.title} (${task.projectName})`}
      className={cn(
        "group flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all",
        "bg-card/90 hover:bg-card border border-border/80 shadow-xs select-none",
        className
      )}
    >
      <span className={cn("size-2 rounded-full shrink-0", colorStyle.iconBg, colorStyle.iconText)} />
      <CheckSquare className="size-3 shrink-0 text-muted-foreground group-hover:text-foreground" />
      <span className="truncate flex-1 text-foreground">{task.title}</span>
      <span className="text-[10px] text-muted-foreground shrink-0 uppercase tracking-wider font-semibold">
        Due
      </span>
    </div>
  );
}
