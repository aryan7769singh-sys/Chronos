import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";
import { getCalendarFeed } from "@/services/calendar.service";
import { getTimeBlocks } from "@/services/planning.service";
import { getAllProjects } from "@/services/project.service";
import { prisma } from "@/lib/prisma";
import { CalendarView } from "@/features/calendar/components/CalendarView";
import type { CalendarViewMode } from "@/features/calendar/types";
import type { Task, Priority } from "@/features/tasks/types";

export const metadata = {
  title: "Calendar — Chronos",
  description: "Unified productivity calendar with time blocks, meetings, and task deadlines.",
};

interface CalendarPageProps {
  searchParams: Promise<{
    view?: string;
    date?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/calendar");
  }

  const { view, date } = await searchParams;

  // Validate view mode
  const validModes: CalendarViewMode[] = ["month", "week", "day"];
  const viewMode: CalendarViewMode =
    view && validModes.includes(view as CalendarViewMode)
      ? (view as CalendarViewMode)
      : "month";

  // Validate date (default to today)
  let targetDate = new Date();
  if (date) {
    const parsed = parseISO(date);
    if (isValid(parsed)) {
      targetDate = parsed;
    }
  }

  // Calculate required query date range based on viewMode
  let rangeStart: Date;
  let rangeEnd: Date;

  if (viewMode === "month") {
    // Include full month matrix buffer days
    rangeStart = startOfWeek(startOfMonth(targetDate), { weekStartsOn: 0 });
    rangeEnd = endOfWeek(endOfMonth(targetDate), { weekStartsOn: 0 });
  } else if (viewMode === "week") {
    rangeStart = startOfWeek(targetDate, { weekStartsOn: 0 });
    rangeEnd = endOfWeek(targetDate, { weekStartsOn: 0 });
  } else {
    rangeStart = startOfDay(targetDate);
    rangeEnd = endOfDay(targetDate);
  }

  // Fetch CalendarEvents, TimeBlocks, projects, and tasks in parallel
  const [calendarItems, timeBlocks, projects, userTasks] = await Promise.all([
    getCalendarFeed(session.user.id, rangeStart, rangeEnd),
    getTimeBlocks(session.user.id, rangeStart, rangeEnd),
    getAllProjects(session.user.id),
    prisma.task.findMany({
      where: {
        deletedAt: null,
        project: {
          userId: session.user.id,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        estimatedDuration: true,
        actualDuration: true,
        deadline: true,
        currentStep: true,
        tags: true,
        notes: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const mappedTasks: Task[] = userTasks.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status as Task["status"],
    priority: t.priority as Priority,
    estimatedDuration: t.estimatedDuration,
    actualDuration: t.actualDuration,
    deadline: t.deadline.toISOString(),
    progress: 0,
    currentStep: t.currentStep,
    tags: t.tags,
    notes: t.notes,
    createdAt: t.createdAt.toISOString(),
  }));

  const initialDateStr = format(targetDate, "yyyy-MM-dd");

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <CalendarView
        initialDateStr={initialDateStr}
        initialView={viewMode}
        items={calendarItems}
        timeBlocks={timeBlocks}
        projects={projects}
        tasks={mappedTasks}
      />
    </div>
  );
}
