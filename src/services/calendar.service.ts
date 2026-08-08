/**
 * calendar.service.ts
 *
 * Service layer for Calendar domain operations.
 * All Prisma database operations for calendar events and task deadlines are isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import type {
  CalendarEvent,
  CalendarItem,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventType,
} from "@/features/calendar/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// Internal Mappings
// ---------------------------------------------------------------------------

type PrismaEvent = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string;
  type: import("@prisma/client").CalendarEventType;
  allDay: boolean;
  startDate: Date;
  endDate: Date;
  color: string;
  location: string;
  createdAt: Date;
  project?: {
    name: string;
    color: string;
  } | null;
  task?: {
    title: string;
  } | null;
};

function mapEvent(e: PrismaEvent): CalendarEvent {
  return {
    id: e.id,
    userId: e.userId,
    projectId: e.projectId,
    projectName: e.project?.name ?? null,
    projectColor: (e.project?.color as ProjectColor) ?? null,
    taskId: e.taskId,
    taskTitle: e.task?.title ?? null,
    title: e.title,
    description: e.description,
    type: e.type as CalendarEventType,
    allDay: e.allDay,
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    color: (e.color as ProjectColor) || "violet",
    location: e.location,
    createdAt: e.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Query Services
// ---------------------------------------------------------------------------

/**
 * Returns all calendar items (events + task deadlines) within a date range for a user.
 * Task deadlines are aggregated dynamically without duplicating task records.
 */
export async function getCalendarFeed(
  userId: string,
  rangeStart: Date,
  rangeEnd: Date
): Promise<CalendarItem[]> {
  // 1. Fetch non-deleted CalendarEvents owned by the user that overlap the range
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId,
      deletedAt: null,
      startDate: { lte: rangeEnd },
      endDate: { gte: rangeStart },
    },
    include: {
      project: { select: { name: true, color: true } },
      task: { select: { title: true } },
    },
    orderBy: { startDate: "asc" },
  });

  // 2. Fetch non-deleted Tasks with deadlines within the date range from user's projects
  const tasksWithDeadlines = await prisma.task.findMany({
    where: {
      deletedAt: null,
      deadline: {
        gte: rangeStart,
        lte: rangeEnd,
      },
      project: {
        userId,
        deletedAt: null,
      },
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
    },
    orderBy: { deadline: "asc" },
  });

  // 3. Construct unified CalendarItem feed
  const eventItems: CalendarItem[] = events.map((e) => ({
    kind: "event",
    data: mapEvent(e),
  }));

  const taskItems: CalendarItem[] = tasksWithDeadlines.map((t) => ({
    kind: "task_deadline",
    data: {
      taskId: t.id,
      projectId: t.project.id,
      projectName: t.project.name,
      title: t.title,
      deadline: t.deadline.toISOString(),
      priority: t.priority as Priority,
      status: t.status,
      color: t.project.color as ProjectColor,
    },
  }));

  return [...eventItems, ...taskItems];
}

/**
 * Returns a single calendar event by ID, validating user ownership.
 */
export async function getCalendarEventById(
  id: string,
  userId: string
): Promise<CalendarEvent | null> {
  const event = await prisma.calendarEvent.findFirst({
    where: {
      id,
      userId,
      deletedAt: null,
    },
    include: {
      project: { select: { name: true, color: true } },
      task: { select: { title: true } },
    },
  });

  if (!event) return null;
  return mapEvent(event);
}

// ---------------------------------------------------------------------------
// Mutation Services (Strict Ownership Validation)
// ---------------------------------------------------------------------------

/**
 * Creates a new calendar event with strict user ownership validation on referenced entities.
 */
export async function createCalendarEvent(
  userId: string,
  data: CreateCalendarEventInput
): Promise<CalendarEvent> {
  // Validate Project ownership if projectId is provided
  if (data.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId, deletedAt: null },
    });
    if (!project) {
      throw new Error("Referenced project not found or does not belong to the user.");
    }
  }

  // Validate Task ownership if taskId is provided
  if (data.taskId) {
    const task = await prisma.task.findFirst({
      where: {
        id: data.taskId,
        deletedAt: null,
        project: { userId, deletedAt: null },
      },
    });
    if (!task) {
      throw new Error("Referenced task not found or does not belong to the user.");
    }

    // If both projectId and taskId are provided, verify task belongs to that exact project
    if (data.projectId && task.projectId !== data.projectId) {
      throw new Error("Referenced task does not belong to the selected project.");
    }
  }

  const newEvent = await prisma.calendarEvent.create({
    data: {
      userId,
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      type: data.type ?? "event",
      allDay: data.allDay ?? false,
      startDate: data.startDate,
      endDate: data.endDate,
      color: data.color ?? "violet",
      location: data.location?.trim() ?? "",
      projectId: data.projectId || null,
      taskId: data.taskId || null,
    },
    include: {
      project: { select: { name: true, color: true } },
      task: { select: { title: true } },
    },
  });

  return mapEvent(newEvent);
}

/**
 * Updates an existing calendar event, verifying ownership of event and referenced project/task.
 */
export async function updateCalendarEvent(
  id: string,
  userId: string,
  data: UpdateCalendarEventInput
): Promise<CalendarEvent> {
  // 1. Verify event ownership
  const existing = await prisma.calendarEvent.findFirst({
    where: { id, userId, deletedAt: null },
  });
  if (!existing) {
    throw new Error("Calendar event not found or access denied.");
  }

  // 2. Validate project ownership if being updated
  const targetProjectId = data.projectId !== undefined ? data.projectId : existing.projectId;
  if (targetProjectId) {
    const project = await prisma.project.findFirst({
      where: { id: targetProjectId, userId, deletedAt: null },
    });
    if (!project) {
      throw new Error("Referenced project does not belong to user.");
    }
  }

  // 3. Validate task ownership if being updated
  const targetTaskId = data.taskId !== undefined ? data.taskId : existing.taskId;
  if (targetTaskId) {
    const task = await prisma.task.findFirst({
      where: {
        id: targetTaskId,
        deletedAt: null,
        project: { userId, deletedAt: null },
      },
    });
    if (!task) {
      throw new Error("Referenced task does not belong to user.");
    }

    if (targetProjectId && task.projectId !== targetProjectId) {
      throw new Error("Referenced task does not belong to the selected project.");
    }
  }

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description.trim() } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.allDay !== undefined ? { allDay: data.allDay } : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.location !== undefined ? { location: data.location.trim() } : {}),
      ...(data.projectId !== undefined ? { projectId: data.projectId || null } : {}),
      ...(data.taskId !== undefined ? { taskId: data.taskId || null } : {}),
    },
    include: {
      project: { select: { name: true, color: true } },
      task: { select: { title: true } },
    },
  });

  return mapEvent(updated);
}

/**
 * Soft deletes a calendar event after verifying user ownership.
 */
export async function deleteCalendarEvent(
  id: string,
  userId: string
): Promise<void> {
  const existing = await prisma.calendarEvent.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Calendar event not found or access denied.");
  }

  await prisma.calendarEvent.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
