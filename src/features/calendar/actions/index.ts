"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/services/calendar.service";
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventType,
} from "../types";
import type { ProjectColor } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Server Actions for Calendar Event Mutations
// ---------------------------------------------------------------------------

export async function createEventAction(formData: {
  title: string;
  description?: string;
  type?: CalendarEventType;
  allDay?: boolean;
  startDate: string; // ISO string from form
  endDate: string;   // ISO string from form
  projectId?: string | null;
  taskId?: string | null;
  color?: ProjectColor;
  location?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create events.");
  }

  const input: CreateCalendarEventInput = {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    allDay: formData.allDay,
    startDate: new Date(formData.startDate),
    endDate: new Date(formData.endDate),
    projectId: formData.projectId || null,
    taskId: formData.taskId || null,
    color: formData.color,
    location: formData.location,
  };

  const event = await createCalendarEvent(session.user.id, input);
  revalidatePath("/calendar");
  return event;
}

export async function updateEventAction(
  id: string,
  formData: {
    title?: string;
    description?: string;
    type?: CalendarEventType;
    allDay?: boolean;
    startDate?: string;
    endDate?: string;
    projectId?: string | null;
    taskId?: string | null;
    color?: ProjectColor;
    location?: string;
  }
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update events.");
  }

  const input: UpdateCalendarEventInput = {
    title: formData.title,
    description: formData.description,
    type: formData.type,
    allDay: formData.allDay,
    startDate: formData.startDate ? new Date(formData.startDate) : undefined,
    endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    projectId: formData.projectId !== undefined ? formData.projectId : undefined,
    taskId: formData.taskId !== undefined ? formData.taskId : undefined,
    color: formData.color,
    location: formData.location,
  };

  const event = await updateCalendarEvent(id, session.user.id, input);
  revalidatePath("/calendar");
  return event;
}

export async function deleteEventAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete events.");
  }

  await deleteCalendarEvent(id, session.user.id);
  revalidatePath("/calendar");
}
