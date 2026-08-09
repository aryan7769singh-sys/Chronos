"use client";

import { useTransition } from "react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  SkipForward,
  Pencil,
  Trash2,
  Play,
  FolderKanban,
  ListTodo,
  Clock,
  Timer,
} from "lucide-react";
import Link from "next/link";
import type { TimeBlockWithRelations } from "../types";
import {
  completeTimeBlockAction,
  skipTimeBlockAction,
  deleteTimeBlockAction,
} from "../actions";
import {
  TIME_BLOCK_STATUS_LABELS,
  TIME_BLOCK_STATUS_COLORS,
} from "../constants";
import { EVENT_COLOR_STYLES } from "@/features/calendar/constants/calendar";
import { cn } from "@/lib/utils";

interface TimeBlockDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlockWithRelations | null;
  onEdit: (block: TimeBlockWithRelations) => void;
}

export function TimeBlockDetails({
  open,
  onOpenChange,
  block,
  onEdit,
}: TimeBlockDetailsProps) {
  const [isPending, startTransition] = useTransition();

  if (!block) return null;

  const start = parseISO(block.startTime);
  const end = parseISO(block.endTime);
  const durationMinutes = differenceInMinutes(end, start);
  const colorStyle =
    EVENT_COLOR_STYLES[block.color as keyof typeof EVENT_COLOR_STYLES] ??
    EVENT_COLOR_STYLES.violet;

  const isActionable =
    block.status !== "completed" &&
    block.status !== "skipped" &&
    block.status !== "cancelled";

  const handleComplete = () => {
    startTransition(async () => {
      await completeTimeBlockAction(block.id);
      onOpenChange(false);
    });
  };

  const handleSkip = () => {
    startTransition(async () => {
      await skipTimeBlockAction(block.id);
      onOpenChange(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteTimeBlockAction(block.id);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {/* Color accent bar */}
            <div
              className={cn(
                "mt-0.5 w-1 h-10 rounded-full shrink-0",
                colorStyle.indicator
              )}
            />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base font-bold text-foreground line-clamp-2">
                {block.title}
              </DialogTitle>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 text-[10px] font-semibold uppercase tracking-wider",
                  TIME_BLOCK_STATUS_COLORS[block.status]
                )}
              >
                {TIME_BLOCK_STATUS_LABELS[block.status]}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-1">
          {/* Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground shrink-0" />
            <div>
              <span className="font-medium text-foreground">
                {format(start, "EEEE, MMMM d")}
              </span>
              <br />
              <span className="text-muted-foreground text-xs">
                {format(start, "h:mm a")} – {format(end, "h:mm a")} ·{" "}
                {durationMinutes}m
              </span>
            </div>
          </div>

          {/* Project */}
          {block.project && (
            <div className="flex items-center gap-2 text-sm">
              <FolderKanban className="size-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium">
                {block.project.name}
              </span>
            </div>
          )}

          {/* Task */}
          {block.task && (
            <div className="flex items-center gap-2 text-sm">
              <ListTodo className="size-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium truncate">
                {block.task.title}
              </span>
            </div>
          )}

          {/* Duration / planned */}
          <div className="flex items-center gap-2 text-sm">
            <Timer className="size-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-xs">
              Planned: {durationMinutes} minutes
              {block.task?.estimatedDuration
                ? ` · Task estimate: ${block.task.estimatedDuration}m`
                : ""}
            </span>
          </div>

          {/* Notes */}
          {block.notes && (
            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 border border-border/40">
              {block.notes}
            </p>
          )}

          {/* Description */}
          {block.description && (
            <p className="text-xs text-muted-foreground">{block.description}</p>
          )}
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-col">
          {/* Primary actions */}
          <div className="flex items-center gap-2 w-full">
            {/* Start Focus */}
            {block.task && isActionable && (
              <Link
                href={`/focus?taskId=${block.task.id}&blockId=${block.id}`}
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <Button
                  id={`tb-detail-focus-${block.id}`}
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                >
                  <Play className="size-3 fill-current" />
                  Start Focus
                </Button>
              </Link>
            )}

            {/* Edit */}
            {isActionable && (
              <Button
                id={`tb-detail-edit-${block.id}`}
                size="sm"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(block);
                }}
                className="gap-1.5 text-xs"
              >
                <Pencil className="size-3" />
                Edit
              </Button>
            )}
          </div>

          {/* Secondary actions */}
          <div className="flex items-center gap-2 w-full">
            {isActionable && (
              <>
                <Button
                  id={`tb-detail-complete-${block.id}`}
                  size="sm"
                  variant="outline"
                  onClick={handleComplete}
                  disabled={isPending}
                  className="flex-1 gap-1.5 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <CheckCircle2 className="size-3" />
                  Complete
                </Button>
                <Button
                  id={`tb-detail-skip-${block.id}`}
                  size="sm"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isPending}
                  className="flex-1 gap-1.5 text-xs text-muted-foreground"
                >
                  <SkipForward className="size-3" />
                  Skip
                </Button>
              </>
            )}

            <Button
              id={`tb-detail-delete-${block.id}`}
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
