"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
} from "@/services/habit.service";
import type {
  CreateHabitInput,
  UpdateHabitInput,
  HabitFrequency,
} from "../types";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Server Actions for Habit Mutations
// ---------------------------------------------------------------------------

export async function createHabitAction(formData: {
  title: string;
  description?: string;
  category?: string;
  color?: ProjectColor;
  icon?: string;
  frequency?: HabitFrequency;
  targetDaysPerWeek?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create habits.");
  }

  if (!formData.title || formData.title.trim() === "") {
    throw new Error("Habit title cannot be empty.");
  }

  const input: CreateHabitInput = {
    title: formData.title,
    description: formData.description,
    category: formData.category || "General",
    color: formData.color || "violet",
    icon: formData.icon || "Repeat2",
    frequency: formData.frequency || "daily",
    targetDaysPerWeek: formData.targetDaysPerWeek || 7,
  };

  const habit = await createHabit(session.user.id, input);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return habit;
}

export async function updateHabitAction(
  id: string,
  formData: {
    title?: string;
    description?: string;
    category?: string;
    color?: ProjectColor;
    icon?: string;
    frequency?: HabitFrequency;
    targetDaysPerWeek?: number;
    archived?: boolean;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update habits.");
  }

  if (formData.title !== undefined && formData.title.trim() === "") {
    throw new Error("Habit title cannot be empty.");
  }

  const input: UpdateHabitInput = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    color: formData.color,
    icon: formData.icon,
    frequency: formData.frequency,
    targetDaysPerWeek: formData.targetDaysPerWeek,
    archived: formData.archived,
  };

  const habit = await updateHabit(id, session.user.id, input);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return habit;
}

export async function deleteHabitAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete habits.");
  }

  await deleteHabit(id, session.user.id);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function toggleHabitAction(habitId: string, dateStr?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to log habits.");
  }

  const result = await toggleHabitCompletion(
    habitId,
    session.user.id,
    dateStr
  );

  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return result;
}
