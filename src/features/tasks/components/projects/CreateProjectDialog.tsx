"use client";

import { useState, useTransition } from "react";
import {
  Layers,
  Globe,
  Package,
  LayoutDashboard,
  Code2,
  BookOpen,
  Rocket,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
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
import type { ProjectColor, Priority } from "../../types";
import { createProjectAction } from "../../actions";

// ---------------------------------------------------------------------------
// Preset options
// ---------------------------------------------------------------------------

const COLOR_OPTIONS: { id: ProjectColor; bg: string; ring: string }[] = [
  { id: "violet", bg: "bg-violet-500", ring: "ring-violet-500" },
  { id: "blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { id: "amber", bg: "bg-amber-500", ring: "ring-amber-500" },
  { id: "emerald", bg: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "red", bg: "bg-red-500", ring: "ring-red-500" },
  { id: "pink", bg: "bg-pink-500", ring: "ring-pink-500" },
];

const ICON_OPTIONS: { id: string; icon: LucideIcon }[] = [
  { id: "Layers", icon: Layers },
  { id: "Globe", icon: Globe },
  { id: "Package", icon: Package },
  { id: "LayoutDashboard", icon: LayoutDashboard },
  { id: "Code2", icon: Code2 },
  { id: "BookOpen", icon: BookOpen },
  { id: "Rocket", icon: Rocket },
  { id: "Briefcase", icon: Briefcase },
];

const PRIORITY_OPTIONS: { id: Priority; label: string; dotClass: string }[] = [
  { id: "urgent", label: "Urgent", dotClass: "bg-destructive" },
  { id: "high", label: "High", dotClass: "bg-orange-500" },
  { id: "medium", label: "Medium", dotClass: "bg-amber-500" },
  { id: "low", label: "Low", dotClass: "bg-muted-foreground/40" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<ProjectColor>("violet");
  const [iconId, setIconId] = useState("Layers");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createProjectAction({
          name,
          description,
          color,
          icon: iconId,
          priority,
          deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
        handleClose();
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to create project."
        );
      }
    });
  }

  function handleClose() {
    setName("");
    setDescription("");
    setColor("violet");
    setIconId("Layers");
    setPriority("medium");
    setDeadline("");
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>

        <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="project-name" className="text-sm font-medium">
              Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="project-name"
              placeholder="e.g. Portfolio Website"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="project-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="project-description"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Accent Color</span>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-label={opt.id}
                  onClick={() => setColor(opt.id)}
                  className={cn(
                    "size-7 rounded-full transition-all duration-150 cursor-pointer",
                    opt.bg,
                    color === opt.id && `ring-2 ring-offset-2 ring-offset-background ${opt.ring}`
                  )}
                />
              ))}
            </div>
          </div>

          {/* Icon picker */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Icon</span>
            <div className="flex gap-2 flex-wrap">
              {ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-label={opt.id}
                    onClick={() => setIconId(opt.id)}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg border transition-all duration-150 cursor-pointer",
                      iconId === opt.id
                        ? "border-ring bg-muted text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" strokeWidth={1.75} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority segmented control */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Priority</span>
            <div className="flex gap-1 p-1 rounded-lg bg-muted">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 rounded-md py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
                    priority === opt.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("size-1.5 rounded-full shrink-0", opt.dotClass)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label htmlFor="project-deadline" className="text-sm font-medium">
              Deadline
            </label>
            <Input
              id="project-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </form>

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
            form="create-project-form"
            disabled={!name.trim() || isPending}
            className="shadow-xs font-medium"
          >
            {isPending ? "Creating…" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
