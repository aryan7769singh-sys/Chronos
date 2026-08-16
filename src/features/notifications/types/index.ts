// ---------------------------------------------------------------------------
// Notifications & Proactive Productivity Domain Types
// ---------------------------------------------------------------------------
// Architecture: Page → Service → Prisma
// Strongly typed notification DTOs for web & desktop shell.
// ---------------------------------------------------------------------------

export type NotificationType =
  | "time_block_upcoming"
  | "time_block_started"
  | "time_block_completed"
  | "focus_completed"
  | "break_completed"
  | "task_deadline"
  | "habit_reminder"
  | "daily_planning";

export type NotificationPriority = "low" | "normal" | "high";

export type NotificationChannel = "web" | "desktop" | "both";

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channel: NotificationChannel;
  entityId: string | null;
  entityType: string | null;
  idempotencyKey: string | null;
  scheduledFor: string; // ISO String
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channel?: NotificationChannel;
  entityId?: string | null;
  entityType?: string | null;
  idempotencyKey?: string | null;
  scheduledFor?: Date | string;
}

export interface NotificationQueryOptions {
  unreadOnly?: boolean;
  limit?: number;
}
