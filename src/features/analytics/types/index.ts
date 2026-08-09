import type { ProjectColor, Priority } from "@/features/tasks/types";
import type { TimerMode } from "@/features/timer/types";
import type { PlanningStats } from "@/features/planning/types";

export type { PlanningStats };
export type AnalyticsTimeRange = "7d" | "30d" | "90d" | "all";

export interface AnalyticsDateInterval {
  startDate: string; // ISO string
  endDate: string; // ISO string
  previousStartDate: string; // ISO string
  previousEndDate: string; // ISO string
  daysInRange: number;
}

export interface KPIMetric {
  currentValue: number;
  previousValue: number;
  changePercent: number | null; // null when previous value is 0 or comparison is not applicable
  trend: "up" | "down" | "neutral";
  unit?: string;
  formattedCurrent: string;
  formattedPrevious?: string;
}

export interface OverviewKPIs {
  totalFocusMinutes: KPIMetric;
  completedTasks: KPIMetric;
  habitAdherenceRate: KPIMetric;
  estimationAccuracy: KPIMetric; // Actual vs Estimated time performance
}

export interface FocusTrendPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Aug 8" or "Mon"
  focusMinutes: number;
  breakMinutes: number;
  sessionCount: number;
}

export interface ProjectTimeAllocation {
  projectId: string;
  projectName: string;
  projectColor: ProjectColor;
  projectIcon: string;
  focusMinutes: number;
  percentage: number;
  taskCount: number;
  completedTaskCount: number;
  health?: "on_track" | "at_risk" | "off_track";
}

export interface ModeDistribution {
  mode: TimerMode;
  label: string;
  minutes: number;
  percentage: number;
  color: string;
}

export interface TimeOfDayBucket {
  bucket: "morning" | "afternoon" | "evening" | "night";
  label: string;
  timeRange: string; // e.g. "6 AM - 12 PM"
  focusMinutes: number;
  percentage: number;
}

export interface TaskVelocityPoint {
  date: string; // YYYY-MM-DD
  label: string;
  completedTasks: number;
  createdTasks: number;
}

export interface TaskPriorityBreakdown {
  priority: Priority;
  label: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export interface HabitAdherencePoint {
  date: string; // YYYY-MM-DD
  label: string;
  completedCount: number;
  totalHabits: number;
  adherencePercent: number;
}

export interface HabitCategoryPerformance {
  category: string;
  activeHabitCount: number;
  totalLogs: number;
  targetLogs: number;
  adherencePercent: number;
}

export interface TopHabitStreak {
  habitId: string;
  title: string;
  color: ProjectColor;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export interface ProductivityInsight {
  id: string;
  type: "peak_time" | "velocity" | "estimation" | "habit_consistency" | "focus_streak" | "info";
  title: string;
  description: string;
  metric?: string;
  impact: "positive" | "warning" | "neutral";
  icon: string;
}

export interface AnalyticsData {
  timeRange: AnalyticsTimeRange;
  interval: AnalyticsDateInterval;
  kpis: OverviewKPIs;
  focus: {
    dailyTrend: FocusTrendPoint[];
    byProject: ProjectTimeAllocation[];
    byMode: ModeDistribution[];
    timeOfDay: TimeOfDayBucket[];
    totalFocusMinutes: number;
    totalBreakMinutes: number;
    completedSessionsCount: number;
  };
  tasks: {
    velocityTrend: TaskVelocityPoint[];
    byPriority: TaskPriorityBreakdown[];
    totalCreated: number;
    totalCompleted: number;
    overdueCount: number;
    completionRate: number | null;
    totalEstimatedMinutes: number;
    totalActualMinutes: number;
  };
  habits: {
    dailyTrend: HabitAdherencePoint[];
    byCategory: HabitCategoryPerformance[];
    topHabits: TopHabitStreak[];
    overallAdherenceRate: number;
    totalActiveHabits: number;
  };
  projects: ProjectTimeAllocation[];
  planning: PlanningStats;
  insights: ProductivityInsight[];
  hasSufficientData: boolean;
}
