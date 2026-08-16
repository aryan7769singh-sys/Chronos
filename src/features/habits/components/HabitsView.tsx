"use client";

import { useState } from "react";
import { Repeat2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { HabitHeader } from "./HabitHeader";
import { HabitStatsBar } from "./HabitStatsBar";
import { HabitWeeklyMatrix } from "./HabitWeeklyMatrix";
import { HabitCard } from "./HabitCard";
import { CreateHabitDialog } from "./CreateHabitDialog";
import { getWeekDays } from "../utils/progress";
import type { HabitWithLogs, HabitStats } from "../types";

interface HabitsViewProps {
  habits: HabitWithLogs[];
  stats: HabitStats;
}

export function HabitsView({ habits, stats }: HabitsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const weekDays = getWeekDays();

  const filteredHabits = habits.filter((h) => {
    if (h.archived) return false;
    if (selectedCategory === "All") return true;
    return h.category === selectedCategory;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* 1. Header with Stats pill, Filters, and New Habit trigger */}
      <HabitHeader
        completedCount={stats.completedTodayCount}
        totalCount={stats.totalHabits}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 2. Top Stats Metrics Bar */}
      <HabitStatsBar stats={stats} />

      {/* 3. 7-Day Consistency Weekly Matrix */}
      {habits.length > 0 && (
        <HabitWeeklyMatrix habits={habits} weekDays={weekDays} />
      )}

      {/* 4. Habit Cards List / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {selectedCategory === "All"
              ? "All Habits"
              : `${selectedCategory} Habits`}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              ({filteredHabits.length})
            </span>
          </h2>
        </div>

        {filteredHabits.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} weekDays={weekDays} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Repeat2}
            title={
              selectedCategory === "All"
                ? "No habits tracked yet"
                : `No ${selectedCategory} habits found`
            }
            description={
              selectedCategory === "All"
                ? "Create your first daily habit to start tracking streaks and building momentum."
                : "Add a habit to this category or switch filters to view your routine."
            }
            action={<CreateHabitDialog />}
          />
        )}
      </div>
    </div>
  );
}
