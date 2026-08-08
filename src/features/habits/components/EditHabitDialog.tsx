"use client";

import { useState, useTransition } from "react";
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
import { updateHabitAction } from "../actions";
import type { HabitWithLogs, HabitFrequency } from "../types";
import type { ProjectColor } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = Object.keys(HABIT_ICON_MAP);

interface EditHabitDialogProps {
  habit: HabitWithLogs;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHabitDialog({
  habit,
  open,
  onOpenChange,
}: EditHabitDialogProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(habit.title);
  const [description, setDescription] = useState(habit.description);
  const [category, setCategory] = useState<string>(habit.category);
  const [color, setColor] = useState<ProjectColor>(habit.color);
  const [icon, setIcon] = useState<string>(habit.icon);
  const [frequency, setFrequency] = useState<HabitFrequency>(habit.frequency);
  const [targetDaysPerWeek, setTargetDaysPerWeek] = useState(
    habit.targetDaysPerWeek
  );
  const [archived, setArchived] = useState(habit.archived);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Habit title cannot be empty.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateHabitAction(habit.id, {
          title,
          description,
          category,
          color,
          icon,
          frequency,
          targetDaysPerWeek,
          archived,
        });
        onOpenChange(false);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to update habit."
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-base font-semibold">
            Edit Habit
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your habit target, frequency, or appearance.
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
              htmlFor="edit-habit-title"
              className="text-xs font-medium text-foreground"
            >
              Habit Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="edit-habit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="edit-habit-desc"
              className="text-xs font-medium text-foreground"
            >
              Description / Intention
            </label>
            <Textarea
              id="edit-habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                  onClick={() => setFrequency("daily")}
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
                  onClick={() => setFrequency("weekly")}
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
                htmlFor="edit-target-days"
                className="text-xs font-medium text-foreground"
              >
                Target Days / Week
              </label>
              <Input
                id="edit-target-days"
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

          {/* Archive Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/20">
            <div>
              <p className="text-xs font-medium text-foreground">Archive Habit</p>
              <p className="text-[11px] text-muted-foreground">
                Hide from active daily tracking without losing streak history.
              </p>
            </div>
            <input
              type="checkbox"
              id="edit-habit-archived"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
              className="size-4 rounded border-border text-violet-600 focus:ring-violet-500 cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
