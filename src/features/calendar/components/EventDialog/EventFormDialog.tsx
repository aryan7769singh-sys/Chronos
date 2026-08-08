"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction, updateEventAction } from "../../actions";
import type { CalendarEvent, CalendarEventType } from "../../types";
import type { Project, Task, ProjectColor } from "@/features/tasks/types";
import { EVENT_COLOR_STYLES } from "../../constants/calendar";
import { cn } from "@/lib/utils";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent | null; // If provided, edit mode; otherwise create mode
  initialDate?: Date;
  projects: Project[];
  tasks: Task[];
}

const COLOR_OPTIONS: ProjectColor[] = [
  "violet",
  "blue",
  "amber",
  "emerald",
  "red",
  "pink",
];

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  initialDate,
  projects,
  tasks,
}: EventFormDialogProps) {
  const isEditing = !!event;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const defaultStart = event
    ? new Date(event.startDate)
    : initialDate
    ? new Date(initialDate.setHours(10, 0, 0, 0))
    : new Date(new Date().setHours(10, 0, 0, 0));

  const defaultEnd = event
    ? new Date(event.endDate)
    : initialDate
    ? new Date(initialDate.setHours(11, 0, 0, 0))
    : new Date(new Date().setHours(11, 0, 0, 0));

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [type, setType] = useState<CalendarEventType>(event?.type ?? "event");
  const [allDay, setAllDay] = useState<boolean>(event?.allDay ?? false);
  const [startDateStr, setStartDateStr] = useState(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
  const [endDateStr, setEndDateStr] = useState(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
  const [projectId, setProjectId] = useState<string>(event?.projectId ?? "");
  const [taskId, setTaskId] = useState<string>(event?.taskId ?? "");
  const [color, setColor] = useState<ProjectColor>(event?.color ?? "violet");
  const [location, setLocation] = useState(event?.location ?? "");

  // Filter tasks based on selected project
  const availableTasks = projectId
    ? tasks.filter((t) => t.projectId === projectId)
    : tasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for the event.");
      return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (end < start) {
      setError("End time cannot be earlier than start time.");
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        if (isEditing && event) {
          await updateEventAction(event.id, {
            title,
            description,
            type,
            allDay,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            projectId: projectId || null,
            taskId: taskId || null,
            color,
            location,
          });
        } else {
          await createEventAction({
            title,
            description,
            type,
            allDay,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            projectId: projectId || null,
            taskId: taskId || null,
            color,
            location,
          });
        }
        onOpenChange(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save calendar event.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing ? "Edit Calendar Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Schedule a time block, meeting, or milestone in your Chronos calendar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-title" className="text-xs font-medium text-foreground">
              Event Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="event-title"
              placeholder="e.g. Deep Work: Database Migration"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
              required
            />
          </div>

          {/* Type & Color Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-type" className="text-xs font-medium text-foreground">
                Type
              </label>
              <select
                id="event-type"
                value={type}
                onChange={(e) => setType(e.target.value as CalendarEventType)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="event">Event</option>
                <option value="focus_block">Focus Block</option>
                <option value="meeting">Meeting</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Accent Color</label>
              <div className="flex items-center gap-1.5 h-9">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-5 rounded-full transition-transform",
                      EVENT_COLOR_STYLES[c].indicator,
                      color === c && "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                    )}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-2">
            <input
              id="event-allday"
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="size-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="event-allday" className="text-xs font-medium text-foreground cursor-pointer">
              All-day event
            </label>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-start" className="text-xs font-medium text-foreground">
                Start Time
              </label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-end" className="text-xs font-medium text-foreground">
                End Time
              </label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Project & Task Linking */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-project" className="text-xs font-medium text-foreground">
                Link to Project (Optional)
              </label>
              <select
                id="event-project"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setTaskId(""); // Reset task when project changes
                }}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="event-task" className="text-xs font-medium text-foreground">
                Link to Task (Optional)
              </label>
              <select
                id="event-task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">No Task</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-location" className="text-xs font-medium text-foreground">
              Location (Optional)
            </label>
            <Input
              id="event-location"
              placeholder="e.g. Focus Room A / Google Meet"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-description" className="text-xs font-medium text-foreground">
              Description (Optional)
            </label>
            <Textarea
              id="event-description"
              placeholder="Add agenda, notes, or execution details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-16 text-xs resize-none"
            />
          </div>

          <DialogFooter className="mt-2 flex items-center justify-end gap-2">
            <Button
              id="event-form-cancel-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              id="event-form-submit-btn"
              type="submit"
              size="sm"
              disabled={isPending}
            >
              {isPending
                ? isEditing
                  ? "Saving Changes..."
                  : "Creating Event..."
                : isEditing
                ? "Save Changes"
                : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
