"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Priority } from "../../types";

const PRIORITY_OPTIONS: { id: Priority; label: string; dotClass: string }[] = [
  { id: "urgent", label: "Urgent", dotClass: "bg-destructive" },
  { id: "high", label: "High", dotClass: "bg-orange-500" },
  { id: "medium", label: "Medium", dotClass: "bg-amber-500" },
  { id: "low", label: "Low", dotClass: "bg-muted-foreground/40" },
];

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function CreateTaskDialog({
  open,
  onClose,
  // projectId will be used when persistence is wired in a future milestone
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // UI only — no persistence in this milestone
    handleClose();
  }

  function handleClose() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDeadline("");
    setTagsInput("");
    onClose();
  }

  // Display parsed tags as preview badges
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              placeholder="e.g. Implement authentication flow"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="What needs to be done?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Priority</span>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-all duration-150",
                    priority === opt.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className={cn("size-1.5 rounded-full shrink-0", opt.dotClass)}
                  />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label htmlFor="task-deadline" className="text-sm font-medium">
              Deadline
            </label>
            <Input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label htmlFor="task-tags" className="text-sm font-medium">
              Tags
              <span className="text-muted-foreground font-normal ml-1">
                (comma-separated)
              </span>
            </label>
            <Input
              id="task-tags"
              placeholder="e.g. frontend, api, auth"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" size="sm" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            form="create-task-form"
            disabled={!title.trim()}
          >
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
