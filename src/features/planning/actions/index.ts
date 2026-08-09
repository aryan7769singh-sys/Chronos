"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  completeTimeBlock,
  skipTimeBlock,
} from "@/services/planning.service";
import type { CreateTimeBlockInput, UpdateTimeBlockInput } from "../types";

// ---------------------------------------------------------------------------
// Revalidation helper
// ---------------------------------------------------------------------------

function revalidateAll(projectId?: string | null) {
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath("/focus");
  revalidatePath("/analytics");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

// ---------------------------------------------------------------------------
// createTimeBlockAction
// ---------------------------------------------------------------------------

export async function createTimeBlockAction(input: CreateTimeBlockInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create time blocks.");
  }

  if (!input.title?.trim()) {
    throw new Error("Time block title is required.");
  }

  if (!input.startTime || !input.endTime) {
    throw new Error("Start time and end time are required.");
  }

  const result = await createTimeBlock(session.user.id, input);

  // Conflict detected and allowConflict was false — return conflicts without revalidating
  if (result.conflicts.length > 0 && !result.block) {
    return result;
  }

  revalidateAll(result.block.projectId);
  return result;
}

// ---------------------------------------------------------------------------
// updateTimeBlockAction
// ---------------------------------------------------------------------------

export async function updateTimeBlockAction(blockId: string, input: UpdateTimeBlockInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update time blocks.");
  }

  if (!blockId) {
    throw new Error("Time block ID is required.");
  }

  const result = await updateTimeBlock(session.user.id, blockId, input);

  if (result.conflicts.length > 0 && !result.block) {
    return result;
  }

  revalidateAll(result.block.projectId);
  return result;
}

// ---------------------------------------------------------------------------
// deleteTimeBlockAction
// ---------------------------------------------------------------------------

export async function deleteTimeBlockAction(blockId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete time blocks.");
  }

  if (!blockId) {
    throw new Error("Time block ID is required.");
  }

  await deleteTimeBlock(session.user.id, blockId);
  revalidateAll();
}

// ---------------------------------------------------------------------------
// completeTimeBlockAction
// ---------------------------------------------------------------------------

export async function completeTimeBlockAction(blockId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const block = await completeTimeBlock(session.user.id, blockId);
  revalidateAll(block.projectId);
  return block;
}

// ---------------------------------------------------------------------------
// skipTimeBlockAction
// ---------------------------------------------------------------------------

export async function skipTimeBlockAction(blockId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in.");
  }

  const block = await skipTimeBlock(session.user.id, blockId);
  revalidateAll(block.projectId);
  return block;
}

// ---------------------------------------------------------------------------
// moveTimeBlockAction — changes startTime and endTime together
// ---------------------------------------------------------------------------

export async function moveTimeBlockAction(
  blockId: string,
  newStartTime: string,
  newEndTime: string,
  allowConflict = false
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to move time blocks.");
  }

  const result = await updateTimeBlock(session.user.id, blockId, {
    startTime: newStartTime,
    endTime: newEndTime,
    allowConflict,
  });

  if (result.conflicts.length > 0 && !result.block) {
    return result;
  }

  revalidateAll(result.block.projectId);
  return result;
}

// ---------------------------------------------------------------------------
// resizeTimeBlockAction — changes only the endTime
// ---------------------------------------------------------------------------

export async function resizeTimeBlockAction(
  blockId: string,
  newEndTime: string,
  allowConflict = false
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to resize time blocks.");
  }

  const result = await updateTimeBlock(session.user.id, blockId, {
    endTime: newEndTime,
    allowConflict,
  });

  if (result.conflicts.length > 0 && !result.block) {
    return result;
  }

  revalidateAll(result.block.projectId);
  return result;
}
