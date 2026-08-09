"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView/MonthView";
import { WeekView } from "./WeekView/WeekView";
import { DayView } from "./DayView/DayView";
import { EventFormDialog } from "./EventDialog/EventFormDialog";
import { EventDetailModal } from "./EventDialog/EventDetailModal";
import { TimeBlockDialog } from "@/features/planning/components/TimeBlockDialog";
import { TimeBlockDetails } from "@/features/planning/components/TimeBlockDetails";
import { navigateDate } from "../utils/dateGrid";
import type { CalendarItem, CalendarEvent, CalendarViewMode } from "../types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import type { Project, Task } from "@/features/tasks/types";

interface CalendarViewProps {
  initialDateStr: string; // "yyyy-MM-dd"
  initialView: CalendarViewMode;
  items: CalendarItem[];
  timeBlocks: TimeBlockWithRelations[];
  projects: Project[];
  tasks: Task[];
}

export function CalendarView({
  initialDateStr,
  initialView,
  items,
  timeBlocks,
  projects,
  tasks,
}: CalendarViewProps) {
  const router = useRouter();
  const currentDate = parseISO(initialDateStr);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialView);

  // ── CalendarEvent dialog state ──
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>(undefined);

  // ── TimeBlock dialog state ──
  const [isTBDialogOpen, setIsTBDialogOpen] = useState(false);
  const [isTBDetailOpen, setIsTBDetailOpen] = useState(false);
  const [activeBlock, setActiveBlock] = useState<TimeBlockWithRelations | null>(null);
  const [tbInitialDate, setTbInitialDate] = useState<Date | undefined>(undefined);

  // Synchronize date / view updates to URL search params
  const updateUrl = (date: Date, mode: CalendarViewMode) => {
    const formatted = format(date, "yyyy-MM-dd");
    router.push(`/calendar?view=${mode}&date=${formatted}`);
  };

  const handleNavigate = (direction: "prev" | "next") => {
    const nextDate = navigateDate(currentDate, direction, viewMode);
    updateUrl(nextDate, viewMode);
  };

  const handleToday = () => {
    updateUrl(new Date(), viewMode);
  };

  const handleViewChange = (mode: CalendarViewMode) => {
    setViewMode(mode);
    updateUrl(currentDate, mode);
  };

  // ── CalendarEvent handlers ──
  const handleOpenCreateEvent = (slotDate?: Date) => {
    setActiveEvent(null);
    setSelectedSlotDate(slotDate ?? currentDate);
    setIsEventFormOpen(true);
  };

  const handleOpenEventDetail = (event: CalendarEvent) => {
    setActiveEvent(event);
    setIsEventDetailOpen(true);
  };

  const handleOpenEditEvent = (event: CalendarEvent) => {
    setActiveEvent(event);
    setSelectedSlotDate(new Date(event.startDate));
    setIsEventFormOpen(true);
  };

  // ── TimeBlock handlers ──
  const handleOpenCreateTimeBlock = (slotDate?: Date) => {
    setActiveBlock(null);
    setTbInitialDate(slotDate ?? currentDate);
    setIsTBDialogOpen(true);
  };

  const handleOpenTimeBlockDetail = (block: TimeBlockWithRelations) => {
    setActiveBlock(block);
    setIsTBDetailOpen(true);
  };

  const handleOpenEditTimeBlock = (block: TimeBlockWithRelations) => {
    setActiveBlock(block);
    setIsTBDetailOpen(false);
    setIsTBDialogOpen(true);
  };

  const handleDayClick = (day: Date) => {
    setViewMode("day");
    updateUrl(day, "day");
  };

  // Slot click in Day/Week: open TimeBlock dialog pre-filled with time
  const handleSlotClick = (slotDate: Date) => {
    handleOpenCreateTimeBlock(slotDate);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Header with Navigation, View Switcher & Create buttons */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onNewEvent={() => handleOpenCreateEvent()}
        onNewTimeBlock={() => handleOpenCreateTimeBlock()}
      />

      {/* Main View Grid based on viewMode */}
      {viewMode === "month" && (
        <MonthView
          currentDate={currentDate}
          items={items}
          timeBlocks={timeBlocks}
          onEventClick={handleOpenEventDetail}
          onTimeBlockClick={handleOpenTimeBlockDetail}
          onDayClick={handleDayClick}
        />
      )}

      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          items={items}
          timeBlocks={timeBlocks}
          onEventClick={handleOpenEventDetail}
          onTimeBlockClick={handleOpenTimeBlockDetail}
          onSlotClick={handleSlotClick}
        />
      )}

      {viewMode === "day" && (
        <DayView
          currentDate={currentDate}
          items={items}
          timeBlocks={timeBlocks}
          onEventClick={handleOpenEventDetail}
          onTimeBlockClick={handleOpenTimeBlockDetail}
          onSlotClick={handleSlotClick}
        />
      )}

      {/* ── CalendarEvent Dialogs ── */}
      <EventFormDialog
        open={isEventFormOpen}
        onOpenChange={setIsEventFormOpen}
        event={activeEvent}
        initialDate={selectedSlotDate}
        projects={projects}
        tasks={tasks}
      />

      <EventDetailModal
        open={isEventDetailOpen}
        onOpenChange={setIsEventDetailOpen}
        event={activeEvent}
        onEdit={handleOpenEditEvent}
      />

      {/* ── TimeBlock Dialogs ── */}
      <TimeBlockDialog
        open={isTBDialogOpen}
        onOpenChange={setIsTBDialogOpen}
        block={activeBlock}
        initialDate={tbInitialDate}
        projects={projects}
        tasks={tasks}
      />

      <TimeBlockDetails
        open={isTBDetailOpen}
        onOpenChange={setIsTBDetailOpen}
        block={activeBlock}
        onEdit={handleOpenEditTimeBlock}
      />
    </div>
  );
}
