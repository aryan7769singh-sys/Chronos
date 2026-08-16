"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/ui/form-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Priority, TaskStatus, TaskWithProject } from "../../types";
import { updateTaskAction } from "../../actions";

const PRIORITY_OPTIONS: { id: Priority; label: string; dotClass: string }[] = [
  { id: "urgent", label: "Urgent", dotClass: "bg-destructive" },
  { id: "high", label: "High", dotClass: "bg-orange-500" },
  { id: "medium", label: "Medium", dotClass: "bg-amber-500" },
  { id: "low", label: "Low", dotClass: "bg-muted-foreground/40" },
];

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

interface EditTaskDialogProps {
  task: TaskWithProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: EditTaskDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [deadline, setDeadline] = useState(
    task.deadline ? task.deadline.slice(0, 10) : ""
  );
  const [estimatedDuration, setEstimatedDuration] = useState(
    task.estimatedDuration
  );
  const [actualDuration, setActualDuration] = useState(task.actualDuration);
  const [currentStep, setCurrentStep] = useState(task.currentStep);
  const [tagsInput, setTagsInput] = useState(task.tags ? task.tags.join(", ") : "");
  const [notes, setNotes] = useState(task.notes || "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title cannot be empty.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const parsedTags = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        await updateTaskAction(
          task.id,
          {
            title,
            description,
            status,
            priority,
            deadline: deadline ? new Date(deadline).toISOString() : undefined,
            estimatedDuration: Number(estimatedDuration) || 0,
            actualDuration: Number(actualDuration) || 0,
            currentStep,
            tags: parsedTags,
            notes,
          },
          task.projectId
        );

        onOpenChange(false);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to update task."
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form id="edit-task-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-title" className="text-xs font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-description" className="text-xs font-medium">
              Description
            </label>
            <Textarea
              id="edit-task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Status & Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="edit-task-status"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              options={STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
            />

            <FormSelect
              id="edit-task-priority"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              options={PRIORITY_OPTIONS.map((p) => ({ value: p.id, label: p.label }))}
            />
          </div>

          {/* Deadline & Estimated Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="edit-task-deadline" className="text-xs font-medium">
                Deadline
              </label>
              <Input
                id="edit-task-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-task-duration" className="text-xs font-medium">
                Estimated (min)
              </label>
              <Input
                id="edit-task-duration"
                type="number"
                min={0}
                step={5}
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Actual Duration & Current Step row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="edit-task-actual-duration" className="text-xs font-medium">
                Actual Spent (min)
              </label>
              <Input
                id="edit-task-actual-duration"
                type="number"
                min={0}
                step={5}
                value={actualDuration}
                onChange={(e) => setActualDuration(Number(e.target.value))}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-task-step" className="text-xs font-medium">
                Immediate Next Step
              </label>
              <Input
                id="edit-task-step"
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-tags" className="text-xs font-medium">
              Tags (comma-separated)
            </label>
            <Input
              id="edit-task-tags"
              placeholder="e.g. backend, ui, urgent"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="edit-task-notes" className="text-xs font-medium">
              Notes
            </label>
            <Textarea
              id="edit-task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>
        </form>

        <DialogFooter className="pt-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            form="edit-task-form"
            disabled={!title.trim() || isPending}
            className="shadow-xs font-medium"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
