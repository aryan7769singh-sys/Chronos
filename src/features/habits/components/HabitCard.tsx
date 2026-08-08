"use client";

import { useState, useTransition } from "react";
import {
  Check,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HABIT_COLOR_STYLES } from "../constants/domain";
import { HabitIcon } from "./HabitIcon";
import type { HabitWithLogs, WeekDayInfo } from "../types";
import { toggleHabitAction, deleteHabitAction } from "../actions";
import { EditHabitDialog } from "./EditHabitDialog";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: HabitWithLogs;
  weekDays: WeekDayInfo[];
}

export function HabitCard({ habit, weekDays }: HabitCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const colorStyles =
    HABIT_COLOR_STYLES[habit.color] || HABIT_COLOR_STYLES.violet;

  const handleToggleToday = () => {
    startTransition(async () => {
      try {
        await toggleHabitAction(habit.id);
      } catch (err) {
        console.error("Failed to toggle habit:", err);
      }
    });
  };

  const handleToggleDay = (dateStr: string) => {
    startTransition(async () => {
      try {
        await toggleHabitAction(habit.id, dateStr);
      } catch (err) {
        console.error("Failed to toggle habit day:", err);
      }
    });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${habit.title}"?`)) {
      startTransition(async () => {
        try {
          await deleteHabitAction(habit.id);
        } catch (err) {
          console.error("Failed to delete habit:", err);
        }
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          "border-border/60 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-200",
          habit.completedToday && "bg-primary/[0.03] border-primary/20",
          colorStyles.bgHover
        )}
      >
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Icon + Title + Meta */}
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            {/* Themed Icon Badge */}
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs transition-colors",
                colorStyles.badge
              )}
            >
              <HabitIcon iconName={habit.icon} className="size-5" />
            </div>

            {/* Content info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-foreground tracking-tight truncate">
                  {habit.title}
                </h3>

                {/* Category Pill */}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                  {habit.category}
                </span>

                {/* Streak Counter */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Flame className="size-3.5 fill-amber-500/20" />
                  <span>{habit.currentStreak}d streak</span>
                </span>
              </div>

              {habit.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {habit.description}
                </p>
              )}

              {/* 7-Day Mini Consistency Indicators */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground mr-1 hidden xs:inline-block">
                  Recent:
                </span>
                <div className="flex items-center gap-1">
                  {weekDays.map((day) => {
                    const log = habit.logs.find((l) => l.date === day.dateStr);
                    const isCompleted = !!log?.completed;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        onClick={() => handleToggleDay(day.dateStr)}
                        disabled={isPending}
                        title={`${day.dayName} (${day.dateStr}): ${
                          isCompleted ? "Completed" : "Not completed"
                        }`}
                        aria-label={`${habit.title} on ${day.dayName}: ${
                          isCompleted ? "Completed" : "Incomplete"
                        }`}
                        className={cn(
                          "size-5 rounded-full flex items-center justify-center transition-all cursor-pointer",
                          isCompleted
                            ? cn(colorStyles.indicator, "scale-100")
                            : "bg-muted/70 text-transparent hover:bg-muted ring-1 ring-border/50",
                          day.isToday && !isCompleted && "ring-2 ring-violet-500/40"
                        )}
                      >
                        {isCompleted && (
                          <Check className="size-2.5 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Today's Action Toggle & Menu */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {/* One-click completion toggle */}
            <Button
              id={`habit-toggle-${habit.id}`}
              type="button"
              variant={habit.completedToday ? "default" : "outline"}
              size="sm"
              onClick={handleToggleToday}
              disabled={isPending}
              className={cn(
                "h-9 px-3 gap-1.5 text-xs font-medium transition-all shadow-xs",
                habit.completedToday
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 border-transparent"
                  : "border-border/80 hover:bg-accent/60"
              )}
            >
              <Check
                className={cn(
                  "size-3.5",
                  habit.completedToday ? "stroke-[2.5]" : "text-muted-foreground"
                )}
              />
              <span>{habit.completedToday ? "Completed" : "Check In"}</span>
            </Button>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="size-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Habit options"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs shadow-lg">
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => setIsEditOpen(true)}
                >
                  <Pencil className="size-3.5" />
                  <span>Edit Habit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-500/10"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditHabitDialog
        habit={habit}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </>
  );
}
