"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HABIT_CATEGORIES,
  HABIT_COLORS,
  HABIT_ICON_MAP,
  HABIT_COLOR_STYLES,
} from "../constants/domain";
import { createHabitAction } from "../actions";
import type { ProjectColor } from "@/features/tasks/types";
import type { HabitFrequency } from "../types";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = Object.keys(HABIT_ICON_MAP);

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Productivity");
  const [color, setColor] = useState<ProjectColor>("violet");
  const [icon, setIcon] = useState<string>("Repeat2");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(7);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("Productivity");
    setColor("violet");
    setIcon("Repeat2");
    setFrequency("daily");
    setTargetDaysPerWeek(7);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a habit title.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await createHabitAction({
          title,
          description,
          category,
          color,
          icon,
          frequency,
          targetDaysPerWeek,
        });
        resetForm();
        setOpen(false);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to create habit."
        );
      }
    });
  };

  return (
    <>
      <Button
        id="btn-new-habit"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 font-medium shadow-xs"
      >
        <Plus className="size-4" />
        <span>New Habit</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-semibold">
            Create New Habit
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a daily habit to build consistency and track streaks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="habit-title-input"
              className="text-xs font-medium text-foreground"
            >
              Habit Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="habit-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Code Practice, Read, Drink Water"
              className="h-9 text-xs"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="habit-desc-input"
              className="text-xs font-medium text-foreground"
            >
              Description / Intention
            </label>
            <Textarea
              id="habit-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 20 minutes of deliberate focus each morning."
              className="text-xs min-h-[60px] resize-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer",
                    category === cat
                      ? "bg-primary text-primary-foreground border-primary font-medium"
                      : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Color identity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {HABIT_COLORS.map((c) => {
                const styles = HABIT_COLOR_STYLES[c];
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Select ${c} color`}
                    className={cn(
                      "size-6 rounded-full transition-transform cursor-pointer flex items-center justify-center",
                      styles.indicator,
                      color === c
                        ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Icon</label>
            <div className="grid grid-cols-6 gap-1.5 p-2 rounded-lg border border-border/60 bg-muted/20 max-h-32 overflow-y-auto">
              {AVAILABLE_ICONS.map((iconKey) => {
                const IconComp = HABIT_ICON_MAP[iconKey];
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setIcon(iconKey)}
                    title={iconKey}
                    aria-label={iconKey}
                    className={cn(
                      "size-8 rounded-md flex items-center justify-center transition-all cursor-pointer",
                      icon === iconKey
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <IconComp className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Frequency & Days */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Frequency
              </label>
              <div className="flex rounded-md border border-border/60 p-0.5 bg-muted/30">
                <button
                  type="button"
                  onClick={() => {
                    setFrequency("daily");
                    setTargetDaysPerWeek(7);
                  }}
                  className={cn(
                    "flex-1 text-xs py-1 rounded transition-all cursor-pointer",
                    frequency === "daily"
                      ? "bg-background text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFrequency("weekly");
                    setTargetDaysPerWeek(5);
                  }}
                  className={cn(
                    "flex-1 text-xs py-1 rounded transition-all cursor-pointer",
                    frequency === "weekly"
                      ? "bg-background text-foreground font-medium shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="target-days"
                className="text-xs font-medium text-foreground"
              >
                Target Days / Week
              </label>
              <Input
                id="target-days"
                type="number"
                min={1}
                max={7}
                value={targetDaysPerWeek}
                onChange={(e) =>
                  setTargetDaysPerWeek(
                    Math.max(1, Math.min(7, parseInt(e.target.value) || 1))
                  )
                }
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="shadow-xs font-medium"
            >
              {isPending ? "Creating…" : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </>
  );
}
