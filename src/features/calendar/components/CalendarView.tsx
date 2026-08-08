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
import { navigateDate } from "../utils/dateGrid";
import type { CalendarItem, CalendarEvent, CalendarViewMode } from "../types";
import type { Project, Task } from "@/features/tasks/types";

interface CalendarViewProps {
  initialDateStr: string; // "yyyy-MM-dd"
  initialView: CalendarViewMode;
  items: CalendarItem[];
  projects: Project[];
  tasks: Task[];
}

export function CalendarView({
  initialDateStr,
  initialView,
  items,
  projects,
  tasks,
}: CalendarViewProps) {
  const router = useRouter();
  const currentDate = parseISO(initialDateStr);
  const [viewMode, setViewMode] = useState<CalendarViewMode>(initialView);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | undefined>(undefined);

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

  const handleOpenCreate = (slotDate?: Date) => {
    setActiveEvent(null);
    setSelectedSlotDate(slotDate ?? currentDate);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (event: CalendarEvent) => {
    setActiveEvent(event);
    setIsDetailOpen(true);
  };

  const handleOpenEdit = (event: CalendarEvent) => {
    setActiveEvent(event);
    setSelectedSlotDate(new Date(event.startDate));
    setIsFormOpen(true);
  };

  const handleDayClick = (day: Date) => {
    // When clicking a day in Month view, switch to Day view
    setViewMode("day");
    updateUrl(day, "day");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Calendar Header with Navigation and View Switcher */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={handleNavigate}
        onToday={handleToday}
        onViewChange={handleViewChange}
        onNewEvent={() => handleOpenCreate()}
      />

      {/* Main View Grid based on viewMode */}
      {viewMode === "month" && (
        <MonthView
          currentDate={currentDate}
          items={items}
          onEventClick={handleOpenDetail}
          onDayClick={handleDayClick}
        />
      )}

      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          items={items}
          onEventClick={handleOpenDetail}
          onSlotClick={handleOpenCreate}
        />
      )}

      {viewMode === "day" && (
        <DayView
          currentDate={currentDate}
          items={items}
          onEventClick={handleOpenDetail}
          onSlotClick={handleOpenCreate}
        />
      )}

      {/* Create / Edit Dialog */}
      <EventFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        event={activeEvent}
        initialDate={selectedSlotDate}
        projects={projects}
        tasks={tasks}
      />

      {/* View Details Modal */}
      <EventDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        event={activeEvent}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
