"use client";

import { AnalyticsHeader } from "./AnalyticsHeader";
import { OverviewKPICards } from "./OverviewKPICards";
import { FocusDistributionSection } from "./FocusDistributionSection";
import { TaskVelocitySection } from "./TaskVelocitySection";
import { HabitConsistencySection } from "./HabitConsistencySection";
import { ProjectAllocationSection } from "./ProjectAllocationSection";
import { ProductivityInsightsCard } from "./ProductivityInsightsCard";
import type { AnalyticsData } from "../types";

interface AnalyticsViewProps {
  data: AnalyticsData;
}

export function AnalyticsView({ data }: AnalyticsViewProps) {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* 1. Header with Range Switcher */}
      <AnalyticsHeader
        timeRange={data.timeRange}
        interval={data.interval}
      />

      {/* 2. Primary KPI Overview Cards */}
      <OverviewKPICards
        kpis={data.kpis}
        timeRange={data.timeRange}
      />

      {/* 3. Algorithmic Productivity Insights */}
      <ProductivityInsightsCard
        insights={data.insights}
        hasSufficientData={data.hasSufficientData}
      />

      {/* 4. Deep Work & Focus Time Breakdown */}
      <FocusDistributionSection
        focus={data.focus}
      />

      {/* 5. Task Velocity & Priority Distribution */}
      <TaskVelocitySection
        tasks={data.tasks}
      />

      {/* 6. Habit Consistency & Streaks */}
      <HabitConsistencySection
        habits={data.habits}
      />

      {/* 7. Project Time Investment Allocation */}
      <ProjectAllocationSection
        projects={data.projects}
      />
    </div>
  );
}
