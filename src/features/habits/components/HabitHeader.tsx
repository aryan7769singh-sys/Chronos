"use client";

import { PageHeader } from "@/components/ui/page-header";
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
      <PageHeader
        title="Habits"
        description="Build consistency with daily tracking, streak counters, and habit momentum."
        badge={`${completedCount}/${totalCount} Completed Today`}
        action={<CreateHabitDialog />}
      />

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
