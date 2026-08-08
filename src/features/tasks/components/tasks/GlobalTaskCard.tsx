"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Check,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { formatDistanceToNow, isPast, isToday } from "date-fns";
import type { TaskWithProject } from "../../types";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "../../constants/domain";
import { toggleTaskStatusAction, deleteTaskAction } from "../../actions";
import { EditTaskDialog } from "./EditTaskDialog";
import { cn } from "@/lib/utils";

const PRIORITY_BADGES = {
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border/50",
};

const STATUS_BADGES = {
  backlog: "bg-muted text-muted-foreground",
  todo: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "in-progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  blocked: "bg-destructive/10 text-destructive border-destructive/20",
  "in-review": "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelled: "bg-muted text-muted-foreground line-through",
};

interface GlobalTaskCardProps {
  task: TaskWithProject;
}

export function GlobalTaskCard({ task }: GlobalTaskCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const colorStyles =
    PROJECT_COLOR_STYLES[task.project.color] || PROJECT_COLOR_STYLES.violet;

  const deadlineDate = new Date(task.deadline);
  const isOverdue =
    isPast(deadlineDate) &&
    !isToday(deadlineDate) &&
    task.status !== "done" &&
    task.status !== "cancelled";

  const isDueToday = isToday(deadlineDate) && task.status !== "done";

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleTaskStatusAction(task.id, undefined, task.projectId);
      } catch (err) {
        console.error("Failed to toggle task:", err);
      }
    });
  };

  const handleConfirmDelete = () => {
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteTaskAction(task.id, task.projectId);
        setIsDeleteOpen(false);
      } catch (err: unknown) {
        setDeleteError(
          err instanceof Error ? err.message : "Failed to delete task."
        );
      }
    });
  };

  const isDone = task.status === "done";

  return (
    <>
      <Card
        className={cn(
          "border-border/60 bg-card/60 backdrop-blur-sm shadow-xs transition-all hover:border-border/90 hover:bg-card/90",
          isDone && "opacity-75 bg-muted/20 border-border/40",
          isOverdue && "border-destructive/30 bg-destructive/[0.02]"
        )}
      >
        <CardContent className="p-3.5 sm:p-4 flex flex-col gap-3">
          {/* Top row: Checkbox, Project pill, Priority, Options */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              {/* Status checkbox toggle */}
              <button
                type="button"
                onClick={handleToggle}
                disabled={isPending}
                aria-label={isDone ? "Mark incomplete" : "Mark as completed"}
                className={cn(
                  "mt-0.5 size-4.5 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 border",
                  isDone
                    ? "bg-emerald-600 border-emerald-600 text-white dark:bg-emerald-500"
                    : "border-border/80 bg-background/80 hover:border-primary",
                  isPending && "opacity-60"
                )}
              >
                {isDone && <Check className="size-3 stroke-[3]" />}
              </button>

              {/* Title & Project tag */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Project badge */}
                  <Link
                    href={`/projects/${task.projectId}`}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-opacity hover:opacity-80",
                      colorStyles.badge
                    )}
                  >
                    <ProjectIcon iconName={task.project.icon} className="size-3" />
                    <span className="truncate max-w-[120px]">
                      {task.project.name}
                    </span>
                  </Link>

                  {/* Priority badge */}
                  <span
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
                      PRIORITY_BADGES[task.priority]
                    )}
                  >
                    {task.priority}
                  </span>

                  {/* Status pill */}
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      STATUS_BADGES[task.status]
                    )}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Task Title Link */}
                <Link
                  href={`/projects/${task.projectId}/${task.id}`}
                  className={cn(
                    "block text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors truncate",
                    isDone && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </Link>

                {task.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
                aria-label="Task options"
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs shadow-lg">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Task</span>
                </DropdownMenuItem>
                <Link href={`/projects/${task.projectId}/${task.id}`}>
                  <DropdownMenuItem className="gap-2 cursor-pointer w-full">
                    <ArrowRight className="size-3.5" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Current step callout if present */}
          {task.currentStep && (
            <div className="rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5 border border-border/40">
              <span className="font-semibold text-foreground shrink-0">Next:</span>
              <span className="truncate">{task.currentStep}</span>
            </div>
          )}

          {/* Bottom metadata row: Deadline, Duration, Subtasks, Tags */}
          <div className="flex items-center justify-between gap-3 flex-wrap text-xs pt-1 border-t border-border/40 text-muted-foreground">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Deadline badge */}
              <div
                className={cn(
                  "flex items-center gap-1 text-[11px]",
                  isOverdue && "text-destructive font-semibold",
                  isDueToday && "text-violet-600 dark:text-violet-400 font-semibold"
                )}
              >
                {isOverdue ? (
                  <AlertCircle className="size-3 shrink-0" />
                ) : (
                  <Clock className="size-3 shrink-0" />
                )}
                <span>
                  {isDueToday
                    ? "Due Today"
                    : isOverdue
                    ? `Overdue (${formatDistanceToNow(deadlineDate, { addSuffix: true })})`
                    : formatDistanceToNow(deadlineDate, { addSuffix: true })}
                </span>
              </div>

              {/* Estimated duration */}
              {task.estimatedDuration > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  ~{task.estimatedDuration}m
                </span>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="size-2.5" />
                  <span className="text-[10px] text-muted-foreground">
                    {task.tags.slice(0, 2).join(", ")}
                    {task.tags.length > 2 ? ` +${task.tags.length - 2}` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Subtasks Progress */}
            {task.subtaskCount > 0 && (
              <div className="flex items-center gap-2 min-w-[90px]">
                <Progress value={task.progress} className="h-1.5 flex-1">
                  <ProgressLabel className="sr-only">Subtasks progress</ProgressLabel>
                  <ProgressValue className="sr-only">{task.progress}%</ProgressValue>
                </Progress>
                <span className="text-[10px] font-medium tabular-nums shrink-0">
                  {task.completedSubtaskCount}/{task.subtaskCount}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditTaskDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription className="text-xs pt-1">
              Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{task.title}&quot;</span>? This task will be removed from your active lists.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive my-1">
              {deleteError}
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting…" : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
