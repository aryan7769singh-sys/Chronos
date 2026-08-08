"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createNote,
  updateNote,
  deleteNote,
  toggleNotePinned,
  archiveNote,
} from "@/services/note.service";
import type { CreateNoteInput, UpdateNoteInput } from "../types";

export async function createNoteAction(input: CreateNoteInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create notes.");
  }

  if (!input.title || input.title.trim() === "") {
    throw new Error("Note title is required.");
  }

  const created = await createNote(session.user.id, input);

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  if (created.projectId) {
    revalidatePath(`/projects/${created.projectId}`);
  }
  if (created.projectId && created.taskId) {
    revalidatePath(`/projects/${created.projectId}/${created.taskId}`);
  }

  return created;
}

export async function updateNoteAction(noteId: string, input: UpdateNoteInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update notes.");
  }

  if (!noteId) {
    throw new Error("Note ID is required.");
  }

  const updated = await updateNote(noteId, session.user.id, input);

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/tasks");
  if (updated.projectId) {
    revalidatePath(`/projects/${updated.projectId}`);
  }
  if (updated.projectId && updated.taskId) {
    revalidatePath(`/projects/${updated.projectId}/${updated.taskId}`);
  }

  return updated;
}

export async function deleteNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete notes.");
  }

  if (!noteId) {
    throw new Error("Note ID is required.");
  }

  await deleteNote(noteId, session.user.id);

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/tasks");
}

export async function toggleNotePinnedAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to pin notes.");
  }

  if (!noteId) {
    throw new Error("Note ID is required.");
  }

  const updated = await toggleNotePinned(noteId, session.user.id);

  revalidatePath("/notes");
  revalidatePath("/dashboard");

  return updated;
}

export async function archiveNoteAction(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to archive notes.");
  }

  if (!noteId) {
    throw new Error("Note ID is required.");
  }

  const updated = await archiveNote(noteId, session.user.id);

  revalidatePath("/notes");
  revalidatePath("/dashboard");

  return updated;
}
