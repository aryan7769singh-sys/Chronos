"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
} from "@/services/settings.service";
import type { UpdateSettingsInput, UserSettings } from "../types";

// ---------------------------------------------------------------------------
// Revalidation helper
// ---------------------------------------------------------------------------

function revalidateSettingsRoutes() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/focus");
  revalidatePath("/calendar");
  revalidatePath("/tasks");
  revalidatePath("/analytics");
  revalidatePath("/overlay");
}


// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Fetches user settings for the currently authenticated session.
 */
export async function getUserSettingsAction(): Promise<UserSettings> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to access settings.");
  }
  return getUserSettings(session.user.id);
}

/**
 * Updates settings for the currently authenticated session.
 * Never accepts userId from client input.
 */
export async function updateUserSettingsAction(
  input: UpdateSettingsInput
): Promise<UserSettings> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update settings.");
  }

  const updated = await updateUserSettings(session.user.id, input);
  revalidateSettingsRoutes();
  return updated;
}

/**
 * Resets settings to defaults for the currently authenticated session.
 * Never accepts userId from client input.
 */
export async function resetUserSettingsAction(): Promise<UserSettings> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to reset settings.");
  }

  const reset = await resetUserSettings(session.user.id);
  revalidateSettingsRoutes();
  return reset;
}
