import { auth } from "@/lib/auth";
import { getHabitSummary } from "@/services/habit.service";
import { getTodaysTasks, getUpcomingDeadlines } from "@/services/task.service";
import { WelcomeHero } from "@/features/dashboard/components/WelcomeHero";
import { TodaysFocus } from "@/features/dashboard/components/TodaysFocus";
import { TodaysTasks } from "@/features/dashboard/components/TodaysTasks";
import { UpcomingDeadlines } from "@/features/dashboard/components/UpcomingDeadlines";
import { MiniCalendar } from "@/features/dashboard/components/MiniCalendar";
import { HabitSummary } from "@/features/dashboard/components/HabitSummary";
import { FocusCard } from "@/features/dashboard/components/FocusCard";
import { QuickActions } from "@/features/dashboard/components/QuickActions";

export const metadata = { title: "Dashboard — Chronos" };

export default async function DashboardPage() {
  const session = await auth();

  const [habits, todaysTasks, upcomingDeadlines] = session?.user?.id
    ? await Promise.all([
        getHabitSummary(session.user.id),
        getTodaysTasks(session.user.id),
        getUpcomingDeadlines(session.user.id),
      ])
    : [[], [], []];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-[1400px] mx-auto">
      {/* Row 1 — Full-width welcome hero */}
      <WelcomeHero />

      {/* Row 2 — Two-column hybrid grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 md:gap-6 items-start">
        {/* Left: Primary column */}
        <div className="space-y-4 md:space-y-6">
          <TodaysFocus />
          <TodaysTasks tasks={todaysTasks} />
          <UpcomingDeadlines deadlines={upcomingDeadlines} />
        </div>

        {/* Right: Secondary column */}
        <div className="space-y-4 md:space-y-6">
          <MiniCalendar />
          <HabitSummary habits={habits} />
          <FocusCard />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
