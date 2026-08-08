"use client";

import { useState, useTransition } from "react";
import { FolderKanban, Plus } from "lucide-react";
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
import type { Priority, Project, TaskStatus } from "../../types";
import { createTaskAction } from "../../actions";
import { CreateProjectDialog } from "../projects/CreateProjectDialog";

const PRIORITY_OPTIONS: { id: Priority; label: string; dotClass: string }[] = [
  { id: "urgent", label: "Urgent", dotClass: "bg-destructive" },
  { id: "high", label: "High", dotClass: "bg-orange-500" },
  { id: "medium", label: "Medium", dotClass: "bg-amber-500" },
  { id: "low", label: "Low", dotClass: "bg-muted-foreground/40" },
];

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "in-review", label: "In Review" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  projectId?: string;
  projects?: Project[];
}

export function CreateTaskDialog({
  open,
  onClose,
  projectId: initialProjectId = "",
  projects = [],
}: CreateTaskDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProjectId || (projects[0]?.id ?? "")
  );
  const [priority, setPriority] = useState<Priority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [deadline, setDeadline] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [currentStep, setCurrentStep] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveProjectId = initialProjectId || selectedProjectId;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!effectiveProjectId) {
      setError("Please select a project for the task.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const parsedTags = tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

        await createTaskAction({
          title,
          description,
          projectId: effectiveProjectId,
          priority,
          status,
          deadline: deadline || new Date().toISOString(),
          estimatedDuration: Number(estimatedDuration) || 30,
          currentStep,
          tags: parsedTags,
        });

        handleClose();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to create task."
        );
      }
    });
  }

  function handleClose() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setDeadline("");
    setEstimatedDuration(30);
    setCurrentStep("");
    setTagsInput("");
    setError(null);
    onClose();
  }

  const hasNoProjects = !initialProjectId && projects.length === 0;

  const tags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>

          {hasNoProjects ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center space-y-3 bg-muted/20 my-2">
              <FolderKanban className="size-8 mx-auto text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  No Projects Found
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Tasks in Chronos must belong to a project. Create your first project to start organizing tasks.
                </p>
              </div>
              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    handleClose();
                    setIsCreateProjectOpen(true);
                  }}
                  className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <Plus className="size-3.5" />
                  <span>Create Project</span>
                </Button>
              </div>
            </div>
          ) : (
            <form id="create-task-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
              {error && (
                <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}

              {/* Project selector if not locked to an initialProjectId */}
              {!initialProjectId && projects.length > 0 && (
                <div className="space-y-1.5">
                  <label htmlFor="task-project-select" className="text-xs font-medium">
                    Project <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="task-project-select"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full h-9 rounded-md border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    required
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label htmlFor="task-title" className="text-xs font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="task-title"
                  placeholder="e.g. Implement authentication flow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 text-xs"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="task-description" className="text-xs font-medium">
                  Description / Notes
                </label>
                <Textarea
                  id="task-description"
                  placeholder="What needs to be done?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium">Priority</span>
                <div className="flex gap-1 p-1 rounded-lg bg-muted/40 border border-border/50">
                  {PRIORITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPriority(opt.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                        priority === opt.id
                          ? "bg-background text-foreground shadow-xs"
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

              {/* Status & Estimated Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="task-status-select" className="text-xs font-medium">
                    Initial Status
                  </label>
                  <select
                    id="task-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full h-9 rounded-md border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="task-duration" className="text-xs font-medium">
                    Estimated Minutes
                  </label>
                  <Input
                    id="task-duration"
                    type="number"
                    min={5}
                    step={5}
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-1.5">
                <label htmlFor="task-deadline" className="text-xs font-medium">
                  Deadline
                </label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Current Step */}
              <div className="space-y-1.5">
                <label htmlFor="task-step" className="text-xs font-medium">
                  Immediate Next Step
                </label>
                <Input
                  id="task-step"
                  placeholder="e.g. Write test suite for token rotation"
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label htmlFor="task-tags" className="text-xs font-medium">
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
                  className="h-9 text-xs"
                />
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  form="create-task-form"
                  disabled={!title.trim() || isPending}
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isPending ? "Creating…" : "Create Task"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <CreateProjectDialog
        open={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </>
  );
}
