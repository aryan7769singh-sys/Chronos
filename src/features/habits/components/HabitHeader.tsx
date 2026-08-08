"use client";

import { CheckCircle2 } from "lucide-react";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { HABIT_CATEGORIES } from "../constants/domain";
import { cn } from "@/lib/utils";

interface HabitHeaderProps {
  completedCount: number;
  totalCount: number;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function HabitHeader({
  completedCount,
  totalCount,
  selectedCategory,
  onSelectCategory,
}: HabitHeaderProps) {
  const allCategories = ["All", ...HABIT_CATEGORIES];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title and stats pill */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Habits
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400 border border-violet-500/20">
              <CheckCircle2 className="size-3.5" />
              <span>
                {completedCount}/{totalCount} Completed Today
              </span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Build consistency with daily tracking, streak counters, and habit momentum.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <CreateHabitDialog />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {allCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium shrink-0",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
