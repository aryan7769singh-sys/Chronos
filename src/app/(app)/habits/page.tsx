import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getHabitsByUserId,
  getHabitStats,
} from "@/services/habit.service";
import { HabitsView } from "@/features/habits/components/HabitsView";

export const metadata = {
  title: "Habits — Chronos",
  description: "Track daily habits, build streaks, and achieve consistency.",
};

export default async function HabitsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/habits");
  }

  const [habits, stats] = await Promise.all([
    getHabitsByUserId(session.user.id),
    getHabitStats(session.user.id),
  ]);

  return <HabitsView habits={habits} stats={stats} />;
}
