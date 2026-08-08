"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createFocusSession,
  deleteFocusSession,
} from "@/services/focus.service";
import type { CreateFocusSessionInput, TimerMode } from "../types";

const VALID_MODES: Set<TimerMode> = new Set([
  "pomodoro",
  "short_break",
  "long_break",
  "custom",
  "stopwatch",
]);

const MAX_DURATION_SECONDS = 14400; // 4 hours maximum

export async function recordFocusSessionAction(input: CreateFocusSessionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to record focus sessions.");
  }

  // Validate mode
  if (!VALID_MODES.has(input.mode)) {
    throw new Error("Invalid focus session mode.");
  }

  // Validate duration
  if (typeof input.duration !== "number" || input.duration < 0) {
    throw new Error("Invalid session duration.");
  }

  if (input.duration > MAX_DURATION_SECONDS) {
    throw new Error("Session duration exceeds maximum limit of 4 hours.");
  }

  // Record session via service layer
  const record = await createFocusSession(session.user.id, input);

  revalidatePath("/focus");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  if (input.projectId) {
    revalidatePath(`/projects/${input.projectId}`);
  }
  if (input.projectId && input.taskId) {
    revalidatePath(`/projects/${input.projectId}/${input.taskId}`);
  }

  return record;
}

export async function deleteFocusSessionAction(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete focus sessions.");
  }

  if (!sessionId || typeof sessionId !== "string") {
    throw new Error("Invalid session ID.");
  }

  await deleteFocusSession(sessionId, session.user.id);

  revalidatePath("/focus");
  revalidatePath("/dashboard");
}
