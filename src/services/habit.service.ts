/**
 * habit.service.ts
 *
 * Service layer for Habit domain operations.
 * All Prisma database operations for habits and daily completion logs are isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import type {
  HabitWithLogs,
  HabitSummaryItem,
  HabitStats,
  CreateHabitInput,
  UpdateHabitInput,
  HabitFrequency,
} from "@/features/habits/types";
import type { ProjectColor } from "@/features/tasks/types";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  isCompletedOnDate,
} from "@/features/habits/utils/streak";
import {
  calculateCompletionRate,
  calculateHabitConsistency,
} from "@/features/habits/utils/progress";

// ---------------------------------------------------------------------------
// Helpers & Internal Mapping
// ---------------------------------------------------------------------------

type PrismaHabitWithLogs = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  color: string;
  icon: string;
  frequency: string;
  targetDaysPerWeek: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  logs: {
    id: string;
    habitId: string;
    date: string;
    completed: boolean;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

function mapHabitWithStats(
  h: PrismaHabitWithLogs,
  targetDateStr: string = format(new Date(), "yyyy-MM-dd")
): HabitWithLogs {
  const mappedLogs = h.logs.map((l) => ({
    id: l.id,
    habitId: l.habitId,
    date: l.date,
    completed: l.completed,
    notes: l.notes,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const logDateItems = mappedLogs.map((l) => ({
    date: l.date,
    completed: l.completed,
  }));

  const completedToday = isCompletedOnDate(logDateItems, targetDateStr);
  const currentStreak = calculateCurrentStreak(logDateItems);
  const bestStreak = calculateLongestStreak(logDateItems);
  const completionRate = calculateHabitConsistency(logDateItems, 30);

  return {
    id: h.id,
    userId: h.userId,
    title: h.title,
    description: h.description,
    category: h.category,
    color: (h.color as ProjectColor) || "violet",
    icon: h.icon || "Repeat2",
    frequency: (h.frequency as HabitFrequency) || "daily",
    targetDaysPerWeek: h.targetDaysPerWeek || 7,
    archived: h.archived,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
    logs: mappedLogs,
    completedToday,
    currentStreak,
    bestStreak,
    completionRate,
  };
}

// ---------------------------------------------------------------------------
// Query Services
// ---------------------------------------------------------------------------

/**
 * Fetches all active habits for a user with calculated streaks and recent logs.
 */
export async function getHabitsByUserId(
  userId: string,
  targetDate: string = format(new Date(), "yyyy-MM-dd")
): Promise<HabitWithLogs[]> {
  const records = await prisma.habit.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      logs: {
        orderBy: {
          date: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return records.map((r) => mapHabitWithStats(r, targetDate));
}

/**
 * Computes high-level aggregated statistics for a user's habits.
 */
export async function getHabitStats(
  userId: string,
  targetDate: string = format(new Date(), "yyyy-MM-dd")
): Promise<HabitStats> {
  const habits = await getHabitsByUserId(userId, targetDate);
  const activeHabits = habits.filter((h) => !h.archived);

  const totalHabits = activeHabits.length;
  const completedTodayCount = activeHabits.filter((h) => h.completedToday).length;
  const completionRate = calculateCompletionRate(completedTodayCount, totalHabits);

  const bestStreak = activeHabits.reduce(
    (max, h) => Math.max(max, h.bestStreak),
    0
  );

  const totalActiveStreaks = activeHabits.reduce(
    (sum, h) => sum + h.currentStreak,
    0
  );

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const h of activeHabits) {
    const cat = h.category || "General";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(
    ([category, count]) => ({ category, count })
  );

  return {
    totalHabits,
    completedTodayCount,
    completionRate,
    bestStreak,
    totalActiveStreaks,
    categoryBreakdown,
  };
}

/**
 * Lightweight summary formatted specifically for the Dashboard widget.
 */
export async function getHabitSummary(
  userId: string,
  targetDate: string = format(new Date(), "yyyy-MM-dd")
): Promise<HabitSummaryItem[]> {
  const habits = await getHabitsByUserId(userId, targetDate);

  return habits
    .filter((h) => !h.archived)
    .map((h) => ({
      id: h.id,
      label: h.title,
      icon: h.icon,
      completedToday: h.completedToday,
      streak: h.currentStreak,
      color: h.color,
    }));
}

// ---------------------------------------------------------------------------
// Mutation Services
// ---------------------------------------------------------------------------

/**
 * Creates a new habit for the authenticated user.
 */
export async function createHabit(
  userId: string,
  input: CreateHabitInput
): Promise<HabitWithLogs> {
  const record = await prisma.habit.create({
    data: {
      userId,
      title: input.title.trim(),
      description: input.description?.trim() || "",
      category: input.category?.trim() || "General",
      color: input.color || "violet",
      icon: input.icon || "Repeat2",
      frequency: input.frequency || "daily",
      targetDaysPerWeek: input.targetDaysPerWeek || 7,
    },
    include: {
      logs: true,
    },
  });

  return mapHabitWithStats(record);
}

/**
 * Updates an existing habit ensuring user ownership.
 */
export async function updateHabit(
  id: string,
  userId: string,
  input: UpdateHabitInput
): Promise<HabitWithLogs> {
  const existing = await prisma.habit.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Habit not found or unauthorized.");
  }

  const updated = await prisma.habit.update({
    where: { id },
    data: {
      title: input.title !== undefined ? input.title.trim() : undefined,
      description:
        input.description !== undefined ? input.description.trim() : undefined,
      category: input.category !== undefined ? input.category.trim() : undefined,
      color: input.color !== undefined ? input.color : undefined,
      icon: input.icon !== undefined ? input.icon : undefined,
      frequency: input.frequency !== undefined ? input.frequency : undefined,
      targetDaysPerWeek:
        input.targetDaysPerWeek !== undefined
          ? input.targetDaysPerWeek
          : undefined,
      archived: input.archived !== undefined ? input.archived : undefined,
    },
    include: {
      logs: {
        orderBy: {
          date: "asc",
        },
      },
    },
  });

  return mapHabitWithStats(updated);
}

/**
 * Soft-deletes a habit ensuring user ownership.
 */
export async function deleteHabit(id: string, userId: string): Promise<void> {
  const existing = await prisma.habit.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Habit not found or unauthorized.");
  }

  await prisma.habit.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

/**
 * Toggles or sets daily completion for a habit on a specific date string (YYYY-MM-DD).
 * Upserts the HabitLog record and computes the updated streak.
 */
export async function toggleHabitCompletion(
  habitId: string,
  userId: string,
  dateStr: string = format(new Date(), "yyyy-MM-dd")
): Promise<{ completed: boolean; currentStreak: number }> {
  // Validate user ownership of the parent habit
  const habit = await prisma.habit.findFirst({
    where: {
      id: habitId,
      userId,
      deletedAt: null,
    },
    include: {
      logs: true,
    },
  });

  if (!habit) {
    throw new Error("Habit not found or unauthorized.");
  }

  const existingLog = habit.logs.find((l) => l.date === dateStr);
  const nextCompleted = existingLog ? !existingLog.completed : true;

  if (existingLog) {
    await prisma.habitLog.update({
      where: { id: existingLog.id },
      data: {
        completed: nextCompleted,
      },
    });
  } else {
    await prisma.habitLog.create({
      data: {
        habitId,
        date: dateStr,
        completed: true,
      },
    });
  }

  // Refetch logs to compute exact updated streak
  const updatedLogs = await prisma.habitLog.findMany({
    where: { habitId },
    orderBy: { date: "asc" },
  });

  const streak = calculateCurrentStreak(
    updatedLogs.map((l) => ({ date: l.date, completed: l.completed }))
  );

  return {
    completed: nextCompleted,
    currentStreak: streak,
  };
}
