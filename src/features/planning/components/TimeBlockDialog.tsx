"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createTimeBlockAction,
  updateTimeBlockAction,
} from "../actions";
import { ScheduleConflictDialog } from "./ScheduleConflictDialog";
import type { TimeBlockWithRelations, CreateTimeBlockInput, UpdateTimeBlockInput, ScheduleConflict } from "../types";
import type { Project, Task, ProjectColor } from "@/features/tasks/types";
import { EVENT_COLOR_STYLES } from "@/features/calendar/constants/calendar";
import { PLANNING_COLOR_OPTIONS } from "../constants";
import { cn } from "@/lib/utils";

interface TimeBlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided → edit mode; otherwise → create mode */
  block?: TimeBlockWithRelations | null;
  /** Date/time to pre-populate (for slot clicks) */
  initialDate?: Date;
  /** Pre-filled taskId (from Task Details Schedule button) */
  initialTaskId?: string;
  projects: Project[];
  tasks: Task[];
}

export function TimeBlockDialog({
  open,
  onOpenChange,
  block,
  initialDate,
  initialTaskId,
  projects,
  tasks,
}: TimeBlockDialogProps) {
  const isEditing = !!block;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pendingConflicts, setPendingConflicts] = useState<ScheduleConflict[]>([]);
  const [showConflict, setShowConflict] = useState(false);

  // Form state
  const baseDate = block
    ? new Date(block.startTime)
    : initialDate
    ? new Date(initialDate)
    : new Date();

  const baseEnd = block
    ? new Date(block.endTime)
    : initialDate
    ? new Date(initialDate.getTime() + 60 * 60 * 1000) // +1h
    : new Date(baseDate.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState(block?.title ?? "");
  const [description, setDescription] = useState(block?.description ?? "");
  const [startStr, setStartStr] = useState(format(baseDate, "yyyy-MM-dd'T'HH:mm"));
  const [endStr, setEndStr] = useState(format(baseEnd, "yyyy-MM-dd'T'HH:mm"));
  const [projectId, setProjectId] = useState(block?.projectId ?? "");
  const [taskId, setTaskId] = useState(block?.taskId ?? initialTaskId ?? "");
  const [color, setColor] = useState<ProjectColor>((block?.color ?? "violet") as ProjectColor);
  const [notes, setNotes] = useState(block?.notes ?? "");

  // When task changes, auto-select its project
  const handleTaskChange = (newTaskId: string) => {
    setTaskId(newTaskId);
    if (newTaskId) {
      const t = tasks.find((t) => t.id === newTaskId);
      if (t) setProjectId(t.projectId);
    }
  };

  const availableTasks = projectId
    ? tasks.filter((t) => t.projectId === projectId)
    : tasks;

  const buildInput = (allowConflict = false): CreateTimeBlockInput | UpdateTimeBlockInput => ({
    title,
    description,
    startTime: new Date(startStr).toISOString(),
    endTime: new Date(endStr).toISOString(),
    projectId: projectId || null,
    taskId: taskId || null,
    color,
    notes,
    allowConflict,
  });

  const submit = (allowConflict = false) => {
    if (!title.trim()) {
      setError("Please provide a title.");
      return;
    }
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const input = buildInput(allowConflict);
        let result;
        if (isEditing && block) {
          result = await updateTimeBlockAction(block.id, input as UpdateTimeBlockInput);
        } else {
          result = await createTimeBlockAction(input as CreateTimeBlockInput);
        }

        if (result.conflicts && result.conflicts.length > 0 && !result.block) {
          // Conflict detected — show dialog
          setPendingConflicts(result.conflicts);
          setShowConflict(true);
          return;
        }

        onOpenChange(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save time block.");
      }
    });
  };

  const handleConflictCreateAnyway = () => {
    setShowConflict(false);
    submit(true); // retry with allowConflict = true
  };

  const handleConflictAdjust = () => {
    setShowConflict(false);
    // Dialog stays open so user can adjust time
  };

  const handleConflictCancel = () => {
    setShowConflict(false);
  };

  return (
    <>
      <Dialog open={open && !showConflict} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {isEditing ? "Edit Time Block" : "New Time Block"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Schedule a focused work block in your calendar.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4 mt-2"
          >
            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tb-title" className="text-xs font-medium text-foreground">
                Title <span className="text-destructive">*</span>
              </label>
              <Input
                id="tb-title"
                placeholder="e.g. Deep Work: Database Migration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            {/* Start / End */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tb-start" className="text-xs font-medium text-foreground">
                  Start
                </label>
                <Input
                  id="tb-start"
                  type="datetime-local"
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tb-end" className="text-xs font-medium text-foreground">
                  End
                </label>
                <Input
                  id="tb-end"
                  type="datetime-local"
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            {/* Project & Task */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tb-project" className="text-xs font-medium text-foreground">
                  Project
                </label>
                <select
                  id="tb-project"
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    setTaskId("");
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="tb-task" className="text-xs font-medium text-foreground">
                  Task
                </label>
                <select
                  id="tb-task"
                  value={taskId}
                  onChange={(e) => handleTaskChange(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">No Task</option>
                  {availableTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Accent Color</label>
              <div className="flex items-center gap-2 h-8">
                {PLANNING_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-5 rounded-full transition-transform",
                      EVENT_COLOR_STYLES[c].indicator,
                      color === c &&
                        "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                    )}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tb-notes" className="text-xs font-medium text-foreground">
                Notes
              </label>
              <Textarea
                id="tb-notes"
                placeholder="Execution plan, focus area, context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-14 text-xs resize-none"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tb-desc" className="text-xs font-medium text-foreground">
                Description
              </label>
              <Input
                id="tb-desc"
                placeholder="Short description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="mt-2 flex items-center justify-end gap-2">
              <Button
                id="tb-cancel-btn"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                id="tb-submit-btn"
                type="submit"
                size="sm"
                disabled={isPending}
              >
                {isPending
                  ? isEditing
                    ? "Saving…"
                    : "Creating…"
                  : isEditing
                  ? "Save Changes"
                  : "Create Block"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Conflict resolution */}
      <ScheduleConflictDialog
        open={showConflict}
        conflicts={pendingConflicts}
        onCreateAnyway={handleConflictCreateAnyway}
        onAdjustTime={handleConflictAdjust}
        onCancel={handleConflictCancel}
      />
    </>
  );
}
