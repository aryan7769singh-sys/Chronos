"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  FolderKanban,
  CheckSquare,
  Trash2,
  Edit2,
} from "lucide-react";
import { deleteEventAction } from "../../actions";
import type { CalendarEvent } from "../../types";
import {
  EVENT_TYPE_LABELS,
  EVENT_TYPE_BADGE_CLASSES,
  EVENT_COLOR_STYLES,
} from "../../constants/calendar";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (event: CalendarEvent) => void;
}

export function EventDetailModal({
  event,
  open,
  onOpenChange,
  onEdit,
}: EventDetailModalProps) {
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!event) return null;

  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const colorStyle = EVENT_COLOR_STYLES[event.color] ?? EVENT_COLOR_STYLES.violet;

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        await deleteEventAction(event.id);
        onOpenChange(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete event.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="gap-1.5">
          <div className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full shrink-0", colorStyle.indicator)} />
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-wider font-semibold", EVENT_TYPE_BADGE_CLASSES[event.type])}
            >
              {EVENT_TYPE_LABELS[event.type]}
            </Badge>
            {event.allDay && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                All Day
              </Badge>
            )}
          </div>

          <DialogTitle className="text-base font-semibold text-foreground mt-1">
            {event.title}
          </DialogTitle>
          {event.description && (
            <DialogDescription className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">
              {event.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {error && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Metadata Details */}
        <div className="flex flex-col gap-2.5 py-3 border-y border-border/50 text-xs text-muted-foreground">
          {/* Time */}
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-foreground shrink-0" />
            <span className="text-foreground">
              {event.allDay
                ? format(start, "EEEE, MMMM d, yyyy")
                : `${format(start, "MMM d, yyyy • h:mm a")} – ${format(end, "h:mm a")}`}
            </span>
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-foreground shrink-0" />
              <span>{event.location}</span>
            </div>
          )}

          {/* Linked Project */}
          {event.projectName && (
            <div className="flex items-center gap-2">
              <FolderKanban className="size-3.5 text-foreground shrink-0" />
              <span>
                Project: <strong className="text-foreground font-medium">{event.projectName}</strong>
              </span>
            </div>
          )}

          {/* Linked Task */}
          {event.taskTitle && (
            <div className="flex items-center gap-2">
              <CheckSquare className="size-3.5 text-foreground shrink-0" />
              <span>
                Task: <strong className="text-foreground font-medium">{event.taskTitle}</strong>
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between mt-2 pt-1 sm:justify-between">
          <Button
            id="event-delete-btn"
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 px-2.5 text-xs gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              id="event-close-btn"
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Close
            </Button>
            <Button
              id="event-edit-trigger-btn"
              type="button"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(event);
              }}
              className="h-8 text-xs gap-1.5"
            >
              <Edit2 className="size-3.5" />
              <span>Edit</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
