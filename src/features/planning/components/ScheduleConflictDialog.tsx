"use client";

import { format, differenceInMinutes, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, FolderKanban } from "lucide-react";
import type { ScheduleConflict } from "../types";

interface ScheduleConflictDialogProps {
  open: boolean;
  conflicts: ScheduleConflict[];
  onCreateAnyway: () => void;
  onAdjustTime: () => void;
  onCancel: () => void;
}

export function ScheduleConflictDialog({
  open,
  conflicts,
  onCreateAnyway,
  onAdjustTime,
  onCancel,
}: ScheduleConflictDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="size-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4 text-amber-500" />
            </div>
            <DialogTitle className="text-base font-semibold">
              Scheduling Conflict
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            This time block overlaps with{" "}
            {conflicts.length === 1 ? "another block" : `${conflicts.length} blocks`}{" "}
            already on your calendar.
          </DialogDescription>
        </DialogHeader>

        {/* Conflicting blocks list */}
        <div className="flex flex-col gap-2 my-2">
          {conflicts.map((conflict) => {
            const block = conflict.conflictingBlock;
            const start = parseISO(block.startTime);
            const end = parseISO(block.endTime);
            const duration = differenceInMinutes(end, start);
            return (
              <div
                key={block.id}
                className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {block.title}
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium shrink-0">
                    {conflict.overlapMinutes}m overlap
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {format(start, "h:mm a")} – {format(end, "h:mm a")} · {duration}m
                  </span>
                  {block.project && (
                    <span className="flex items-center gap-1">
                      <FolderKanban className="size-3" />
                      {block.project.name}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
          <div className="flex items-center gap-2 w-full">
            <Button
              id="conflict-adjust-btn"
              size="sm"
              onClick={onAdjustTime}
              className="flex-1 text-xs"
            >
              Adjust Time
            </Button>
            <Button
              id="conflict-anyway-btn"
              size="sm"
              variant="outline"
              onClick={onCreateAnyway}
              className="flex-1 text-xs text-muted-foreground"
            >
              Create Anyway
            </Button>
          </div>
          <Button
            id="conflict-cancel-btn"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="w-full text-xs text-muted-foreground"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
