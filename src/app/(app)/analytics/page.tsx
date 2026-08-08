import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnalyticsData } from "@/services/analytics.service";
import { AnalyticsView } from "@/features/analytics/components/AnalyticsView";
import type { AnalyticsTimeRange } from "@/features/analytics/types";

export const metadata = { title: "Analytics & Intelligence — Chronos" };

interface AnalyticsPageProps {
  searchParams: Promise<{ range?: string }>;
}

const VALID_RANGES: Set<AnalyticsTimeRange> = new Set([
  "7d",
  "30d",
  "90d",
  "all",
]);

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { range } = await searchParams;
  const validRange: AnalyticsTimeRange =
    range && VALID_RANGES.has(range as AnalyticsTimeRange)
      ? (range as AnalyticsTimeRange)
      : "30d";

  const data = await getAnalyticsData(session.user.id, validRange);

  return <AnalyticsView data={data} />;
}
