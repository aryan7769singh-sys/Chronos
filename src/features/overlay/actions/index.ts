"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateUserSettings } from "@/services/settings.service";
import type { OverlaySettings } from "@/features/settings/types";

// ---------------------------------------------------------------------------
// Revalidation helper
// ---------------------------------------------------------------------------

function revalidateOverlayRoutes() {
  revalidatePath("/overlay");
  revalidatePath("/settings");
}

/**
 * Updates desktop overlay preferences for the authenticated user session.
 * Never trusts a client-supplied userId.
 */
export async function updateOverlayPreferencesAction(
  patch: Partial<OverlaySettings>
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update overlay settings.");
  }

  const updated = await updateUserSettings(session.user.id, {
    overlay: patch,
  });

  revalidateOverlayRoutes();
  return updated.overlay;
}
