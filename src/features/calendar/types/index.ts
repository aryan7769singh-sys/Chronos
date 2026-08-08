import type { ProjectColor, Priority } from "@/features/tasks/types";

// ---------------------------------------------------------------------------
// View & Event Types
// ---------------------------------------------------------------------------

export type CalendarViewMode = "month" | "week" | "day";

export type CalendarEventType = "event" | "focus_block" | "meeting" | "reminder";

// ---------------------------------------------------------------------------
// CalendarEvent Domain Entity
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  id: string;
  userId: string;
  projectId?: string | null;
  projectName?: string | null;
  projectColor?: ProjectColor | null;
  taskId?: string | null;
  taskTitle?: string | null;
  title: string;
  description: string;
  type: CalendarEventType;
  allDay: boolean;
  /** ISO date string representing UTC timestamp */
  startDate: string;
  /** ISO date string representing UTC timestamp */
  endDate: string;
  color: ProjectColor | "violet";
  location?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Task Deadline Calendar Item (Read-only presentation projection)
// ---------------------------------------------------------------------------

export interface TaskDeadlineItem {
  taskId: string;
  projectId: string;
  projectName: string;
  title: string;
  deadline: string; // ISO string
  priority: Priority;
  status: string;
  color: ProjectColor;
}

// ---------------------------------------------------------------------------
// Unified Calendar Item (Items displayed on any Calendar view)
// ---------------------------------------------------------------------------

export type CalendarItem =
  | { kind: "event"; data: CalendarEvent }
  | { kind: "task_deadline"; data: TaskDeadlineItem };

// ---------------------------------------------------------------------------
// Form / Mutation Inputs
// ---------------------------------------------------------------------------

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  type?: CalendarEventType;
  allDay?: boolean;
  startDate: Date;
  endDate: Date;
  projectId?: string | null;
  taskId?: string | null;
  color?: ProjectColor;
  location?: string;
}

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;
