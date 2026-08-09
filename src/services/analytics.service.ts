/**
 * analytics.service.ts
 *
 * Comprehensive Analytics & Productivity Intelligence Service.
 * Computes live, tenant-isolated KPI metrics, focus distributions,
 * task velocity, habit adherence, project allocations, and data-aware insights.
 *
 * Architecture: Page → Analytics Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import {
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  parseISO,
  differenceInDays,
  getDay,
} from "date-fns";
import type {
  AnalyticsTimeRange,
  AnalyticsDateInterval,
  AnalyticsData,
  OverviewKPIs,
  KPIMetric,
  FocusTrendPoint,
  ProjectTimeAllocation,
  ModeDistribution,
  TimeOfDayBucket,
  TaskVelocityPoint,
  TaskPriorityBreakdown,
  HabitAdherencePoint,
  HabitCategoryPerformance,
  TopHabitStreak,
  ProductivityInsight,
} from "@/features/analytics/types";
import type { ProjectColor, Priority } from "@/features/tasks/types";
import type { TimerMode } from "@/features/timer/types";
import {
  calculateCurrentStreak,
  calculateLongestStreak,
} from "@/features/habits/utils/streak";
import {
  TIMER_MODE_COLORS,
  TIMER_MODE_LABELS,
} from "@/features/timer/constants/timer";
import { getPlanningStats } from "@/services/planning.service";

// ---------------------------------------------------------------------------
// Date Interval Helper
// ---------------------------------------------------------------------------

function resolveDateInterval(timeRange: AnalyticsTimeRange, earliestDate?: Date): AnalyticsDateInterval {
  const now = new Date();
  const currentEnd = endOfDay(now);
  let currentStart: Date;
  let prevStart: Date;
  let prevEnd: Date;
  let daysInRange: number;

  switch (timeRange) {
    case "7d":
      daysInRange = 7;
      currentStart = startOfDay(subDays(now, 6));
      prevEnd = endOfDay(subDays(currentStart, 1));
      prevStart = startOfDay(subDays(prevEnd, 6));
      break;

    case "90d":
      daysInRange = 90;
      currentStart = startOfDay(subDays(now, 89));
      prevEnd = endOfDay(subDays(currentStart, 1));
      prevStart = startOfDay(subDays(prevEnd, 89));
      break;

    case "all":
      currentStart = earliestDate ? startOfDay(earliestDate) : startOfDay(subDays(now, 365));
      daysInRange = Math.max(1, differenceInDays(currentEnd, currentStart) + 1);
      prevEnd = endOfDay(subDays(currentStart, 1));
      prevStart = startOfDay(subDays(prevEnd, Math.min(365, daysInRange)));
      break;

    case "30d":
    default:
      daysInRange = 30;
      currentStart = startOfDay(subDays(now, 29));
      prevEnd = endOfDay(subDays(currentStart, 1));
      prevStart = startOfDay(subDays(prevEnd, 29));
      break;
  }

  return {
    startDate: currentStart.toISOString(),
    endDate: currentEnd.toISOString(),
    previousStartDate: prevStart.toISOString(),
    previousEndDate: prevEnd.toISOString(),
    daysInRange,
  };
}

// ---------------------------------------------------------------------------
// KPI Metric Helper with Safe Zero-Denominator Handling
// ---------------------------------------------------------------------------

function computeKPIMetric(
  current: number,
  previous: number,
  unit?: string,
  formatter?: (val: number) => string
): KPIMetric {
  const formattedCurrent = formatter ? formatter(current) : `${current}${unit ? ` ${unit}` : ""}`;
  const formattedPrevious = formatter ? formatter(previous) : `${previous}${unit ? ` ${unit}` : ""}`;

  if (previous === 0) {
    return {
      currentValue: current,
      previousValue: previous,
      changePercent: null, // Neutral when previous period was 0
      trend: current > 0 ? "up" : "neutral",
      unit,
      formattedCurrent,
      formattedPrevious,
    };
  }

  const diff = current - previous;
  const changePercent = Math.round((diff / previous) * 100);
  const trend: "up" | "down" | "neutral" =
    changePercent > 0 ? "up" : changePercent < 0 ? "down" : "neutral";

  return {
    currentValue: current,
    previousValue: previous,
    changePercent,
    trend,
    unit,
    formattedCurrent,
    formattedPrevious,
  };
}

function formatMinutesDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ---------------------------------------------------------------------------
// Main Service Method
// ---------------------------------------------------------------------------

export async function getAnalyticsData(
  userId: string,
  timeRange: AnalyticsTimeRange = "30d"
): Promise<AnalyticsData> {
  // 1. Fetch earliest user activity date for "all" range resolution
  const earliestSession = await prisma.focusSession.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  const interval = resolveDateInterval(timeRange, earliestSession?.createdAt);
  const currentStartDate = parseISO(interval.startDate);
  const currentEndDate = parseISO(interval.endDate);
  const previousStartDate = parseISO(interval.previousStartDate);
  const previousEndDate = parseISO(interval.previousEndDate);

  const startDateStr = format(currentStartDate, "yyyy-MM-dd");
  const endDateStr = format(currentEndDate, "yyyy-MM-dd");

  // 2. Parallel Database Queries strictly scoped to userId
  const [
    currentSessions,
    previousSessions,
    projects,
    tasks,
    habits,
    habitLogs,
  ] = await Promise.all([
    // Current period focus sessions
    prisma.focusSession.findMany({
      where: {
        userId,
        deletedAt: null,
        createdAt: { gte: currentStartDate, lte: currentEndDate },
      },
      include: {
        project: { select: { id: true, name: true, color: true, icon: true } },
      },
      orderBy: { createdAt: "asc" },
    }),

    // Previous period focus sessions (for KPI delta comparison)
    prisma.focusSession.findMany({
      where: {
        userId,
        deletedAt: null,
        createdAt: { gte: previousStartDate, lte: previousEndDate },
      },
      select: { duration: true, mode: true, completed: true },
    }),

    // User's active projects with task counts
    prisma.project.findMany({
      where: { userId, deletedAt: null },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
            actualDuration: true,
            estimatedDuration: true,
            subtasks: { where: { deletedAt: null }, select: { completed: true } },
          },
        },
      },
    }),

    // All tasks owned by user
    prisma.task.findMany({
      where: {
        project: { userId, deletedAt: null },
        deletedAt: null,
      },
      select: {
        id: true,
        projectId: true,
        status: true,
        priority: true,
        estimatedDuration: true,
        actualDuration: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    }),

    // User's active habits
    prisma.habit.findMany({
      where: { userId, deletedAt: null, archived: false },
      include: {
        logs: {
          select: { date: true, completed: true },
        },
      },
    }),

    // Habit logs in the selected date range
    prisma.habitLog.findMany({
      where: {
        habit: { userId, deletedAt: null, archived: false },
        date: { gte: startDateStr, lte: endDateStr },
      },
      include: {
        habit: { select: { id: true, category: true, color: true } },
      },
    }),
  ]);

  // -------------------------------------------------------------------------
  // 3. Focus & Deep Work Processing
  // -------------------------------------------------------------------------
  const isWork = (mode: string) => mode !== "short_break" && mode !== "long_break";

  let currentWorkSeconds = 0;
  let currentBreakSeconds = 0;
  let currentCompletedSessions = 0;

  for (const s of currentSessions) {
    if (isWork(s.mode)) {
      currentWorkSeconds += s.duration;
      if (s.completed) currentCompletedSessions++;
    } else {
      currentBreakSeconds += s.duration;
    }
  }

  let prevWorkSeconds = 0;
  for (const s of previousSessions) {
    if (isWork(s.mode)) {
      prevWorkSeconds += s.duration;
    }
  }

  const currentFocusMinutes = Math.round(currentWorkSeconds / 60);
  const prevFocusMinutes = Math.round(prevWorkSeconds / 60);
  const currentBreakMinutes = Math.round(currentBreakSeconds / 60);

  // Daily Trend Map
  const dayList = eachDayOfInterval({ start: currentStartDate, end: currentEndDate });
  const focusByDayMap = new Map<string, { focusSec: number; breakSec: number; count: number }>();

  for (const d of dayList) {
    const key = format(d, "yyyy-MM-dd");
    focusByDayMap.set(key, { focusSec: 0, breakSec: 0, count: 0 });
  }

  for (const s of currentSessions) {
    const key = format(s.createdAt, "yyyy-MM-dd");
    const entry = focusByDayMap.get(key);
    if (entry) {
      if (isWork(s.mode)) {
        entry.focusSec += s.duration;
        entry.count++;
      } else {
        entry.breakSec += s.duration;
      }
    }
  }

  const dailyTrend: FocusTrendPoint[] = Array.from(focusByDayMap.entries()).map(([date, val]) => ({
    date,
    label: format(parseISO(date), timeRange === "7d" ? "EEE" : "MMM d"),
    focusMinutes: Math.round(val.focusSec / 60),
    breakMinutes: Math.round(val.breakSec / 60),
    sessionCount: val.count,
  }));

  // Focus by Project
  const projectFocusSecMap = new Map<string, number>();
  for (const s of currentSessions) {
    if (s.projectId && isWork(s.mode)) {
      projectFocusSecMap.set(
        s.projectId,
        (projectFocusSecMap.get(s.projectId) || 0) + s.duration
      );
    }
  }

  const projectAllocations: ProjectTimeAllocation[] = projects.map((p) => {
    const directFocusSec = projectFocusSecMap.get(p.id) || 0;
    const directFocusMin = Math.round(directFocusSec / 60);
    const taskActualSum = p.tasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0);
    const totalMinutes = Math.max(directFocusMin, taskActualSum);
    const percentage =
      currentFocusMinutes > 0
        ? Math.min(100, Math.round((totalMinutes / currentFocusMinutes) * 100))
        : 0;

    const completedTasks = p.tasks.filter((t) => t.status === "done").length;

    return {
      projectId: p.id,
      projectName: p.name,
      projectColor: (p.color as ProjectColor) || "violet",
      projectIcon: p.icon || "Layers",
      focusMinutes: totalMinutes,
      percentage,
      taskCount: p.tasks.length,
      completedTaskCount: completedTasks,
      health: p.health as "on_track" | "at_risk" | "off_track",
    };
  });

  // Focus by Mode
  const modeSecondsMap = new Map<TimerMode, number>();
  for (const s of currentSessions) {
    const m = s.mode as TimerMode;
    modeSecondsMap.set(m, (modeSecondsMap.get(m) || 0) + s.duration);
  }

  const totalAllSessionSeconds = currentWorkSeconds + currentBreakSeconds;
  const getModePercentage = (m: TimerMode) => {
    const sec = modeSecondsMap.get(m) || 0;
    return totalAllSessionSeconds > 0 ? Math.min(100, Math.round((sec / totalAllSessionSeconds) * 100)) : 0;
  };

  const byMode: ModeDistribution[] = [
    {
      mode: "pomodoro" as const,
      label: TIMER_MODE_LABELS.pomodoro,
      minutes: Math.round((modeSecondsMap.get("pomodoro") || 0) / 60),
      percentage: getModePercentage("pomodoro"),
      color: TIMER_MODE_COLORS.pomodoro.ring,
    },
    {
      mode: "custom" as const,
      label: TIMER_MODE_LABELS.custom,
      minutes: Math.round((modeSecondsMap.get("custom") || 0) / 60),
      percentage: getModePercentage("custom"),
      color: TIMER_MODE_COLORS.custom.ring,
    },
    {
      mode: "stopwatch" as const,
      label: TIMER_MODE_LABELS.stopwatch,
      minutes: Math.round((modeSecondsMap.get("stopwatch") || 0) / 60),
      percentage: getModePercentage("stopwatch"),
      color: TIMER_MODE_COLORS.stopwatch.ring,
    },
    {
      mode: "short_break" as const,
      label: TIMER_MODE_LABELS.short_break,
      minutes: Math.round((modeSecondsMap.get("short_break") || 0) / 60),
      percentage: getModePercentage("short_break"),
      color: TIMER_MODE_COLORS.short_break.ring,
    },
    {
      mode: "long_break" as const,
      label: TIMER_MODE_LABELS.long_break,
      minutes: Math.round((modeSecondsMap.get("long_break") || 0) / 60),
      percentage: getModePercentage("long_break"),
      color: TIMER_MODE_COLORS.long_break.ring,
    },
  ].filter((m) => m.minutes > 0 || m.mode === "pomodoro");

  // Time of Day Distribution
  const timeBucketsSec: Record<"morning" | "afternoon" | "evening" | "night", number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const s of currentSessions) {
    if (!isWork(s.mode)) continue;
    const hour = s.createdAt.getHours();

    if (hour >= 6 && hour < 12) timeBucketsSec.morning += s.duration;
    else if (hour >= 12 && hour < 18) timeBucketsSec.afternoon += s.duration;
    else if (hour >= 18 && hour < 24) timeBucketsSec.evening += s.duration;
    else timeBucketsSec.night += s.duration;
  }

  const getTimeBucketPercentage = (sec: number) =>
    currentWorkSeconds > 0 ? Math.min(100, Math.round((sec / currentWorkSeconds) * 100)) : 0;

  const timeOfDay: TimeOfDayBucket[] = [
    {
      bucket: "morning",
      label: "Morning",
      timeRange: "6 AM – 12 PM",
      focusMinutes: Math.round(timeBucketsSec.morning / 60),
      percentage: getTimeBucketPercentage(timeBucketsSec.morning),
    },
    {
      bucket: "afternoon",
      label: "Afternoon",
      timeRange: "12 PM – 6 PM",
      focusMinutes: Math.round(timeBucketsSec.afternoon / 60),
      percentage: getTimeBucketPercentage(timeBucketsSec.afternoon),
    },
    {
      bucket: "evening",
      label: "Evening",
      timeRange: "6 PM – 12 AM",
      focusMinutes: Math.round(timeBucketsSec.evening / 60),
      percentage: getTimeBucketPercentage(timeBucketsSec.evening),
    },
    {
      bucket: "night",
      label: "Night",
      timeRange: "12 AM – 6 AM",
      focusMinutes: Math.round(timeBucketsSec.night / 60),
      percentage: getTimeBucketPercentage(timeBucketsSec.night),
    },
  ];

  // -------------------------------------------------------------------------
  // 4. Task Velocity & Estimation Processing
  // -------------------------------------------------------------------------
  const now = new Date();
  const createdInRange = tasks.filter((t) => t.createdAt >= currentStartDate && t.createdAt <= currentEndDate);
  const completedInRange = tasks.filter((t) => t.status === "done" && t.updatedAt >= currentStartDate && t.updatedAt <= currentEndDate);

  const prevCompleted = tasks.filter((t) => t.status === "done" && t.updatedAt >= previousStartDate && t.updatedAt <= previousEndDate);

  const overdueTasks = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled" && t.deadline < now);

  const velocityByDayMap = new Map<string, { created: number; completed: number }>();
  for (const d of dayList) {
    const key = format(d, "yyyy-MM-dd");
    velocityByDayMap.set(key, { created: 0, completed: 0 });
  }

  for (const t of createdInRange) {
    const key = format(t.createdAt, "yyyy-MM-dd");
    const entry = velocityByDayMap.get(key);
    if (entry) entry.created++;
  }

  for (const t of completedInRange) {
    const key = format(t.updatedAt, "yyyy-MM-dd");
    const entry = velocityByDayMap.get(key);
    if (entry) entry.completed++;
  }

  const velocityTrend: TaskVelocityPoint[] = Array.from(velocityByDayMap.entries()).map(([date, val]) => ({
    date,
    label: format(parseISO(date), timeRange === "7d" ? "EEE" : "MMM d"),
    createdTasks: val.created,
    completedTasks: val.completed,
  }));

  // Priority breakdown
  const priorityOrder: Priority[] = ["urgent", "high", "medium", "low"];
  const priorityLabels: Record<Priority, string> = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  const byPriority: TaskPriorityBreakdown[] = priorityOrder.map((p) => {
    const total = tasks.filter((t) => t.priority === p).length;
    const completed = tasks.filter((t) => t.priority === p && t.status === "done").length;
    return {
      priority: p,
      label: priorityLabels[p],
      totalCount: total,
      completedCount: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  const totalCreatedCount = createdInRange.length;
  const totalCompletedCount = completedInRange.length;
  const taskCompletionRate: number | null =
    totalCreatedCount > 0
      ? Math.min(100, Math.round((totalCompletedCount / totalCreatedCount) * 100))
      : null;

  // Estimation Accuracy (Actual vs Estimated Time on completed tasks)
  const completedWithDurations = tasks.filter(
    (t) => t.status === "done" && t.estimatedDuration > 0 && t.actualDuration > 0
  );

  let totalEstMin = 0;
  let totalActMin = 0;
  let estimationAccuracyPercent = 100;

  if (completedWithDurations.length > 0) {
    for (const t of completedWithDurations) {
      totalEstMin += t.estimatedDuration;
      totalActMin += t.actualDuration;
    }
    // Accuracy formula: 100 - |Actual - Est| / Est * 100 bounded between 0 and 100
    const ratio = Math.min(totalActMin, totalEstMin) / Math.max(totalActMin, totalEstMin);
    estimationAccuracyPercent = Math.round(ratio * 100);
  } else {
    // If no explicit estimates logged yet, fallback to neutral 100%
    estimationAccuracyPercent = 100;
  }

  // -------------------------------------------------------------------------
  // 5. Habit Adherence Processing
  // -------------------------------------------------------------------------
  const completedLogsInRange = habitLogs.filter((l) => l.completed);
  const totalHabitsCount = habits.length;

  const habitByDayMap = new Map<string, number>();
  for (const d of dayList) {
    const key = format(d, "yyyy-MM-dd");
    habitByDayMap.set(key, 0);
  }

  for (const log of completedLogsInRange) {
    if (habitByDayMap.has(log.date)) {
      habitByDayMap.set(log.date, (habitByDayMap.get(log.date) || 0) + 1);
    }
  }

  const habitDailyTrend: HabitAdherencePoint[] = Array.from(habitByDayMap.entries()).map(([date, count]) => ({
    date,
    label: format(parseISO(date), timeRange === "7d" ? "EEE" : "MMM d"),
    completedCount: count,
    totalHabits: totalHabitsCount,
    adherencePercent: totalHabitsCount > 0 ? Math.min(100, Math.round((count / totalHabitsCount) * 100)) : 0,
  }));

  // Category performance
  const categoryMap = new Map<string, { habits: number; logs: number; expected: number }>();
  for (const h of habits) {
    const cat = h.category || "General";
    const existing = categoryMap.get(cat) || { habits: 0, logs: 0, expected: 0 };
    existing.habits++;
    const targetDays = Math.max(1, Math.min(7, h.targetDaysPerWeek || 7));
    existing.expected += interval.daysInRange * (targetDays / 7);
    categoryMap.set(cat, existing);
  }

  for (const log of completedLogsInRange) {
    const cat = log.habit?.category || "General";
    const existing = categoryMap.get(cat);
    if (existing) {
      existing.logs++;
    }
  }

  const byCategory: HabitCategoryPerformance[] = Array.from(categoryMap.entries()).map(([category, val]) => {
    const adherencePercent = val.expected > 0 ? Math.min(100, Math.round((val.logs / val.expected) * 100)) : 0;
    return {
      category,
      activeHabitCount: val.habits,
      totalLogs: val.logs,
      targetLogs: Math.round(val.expected),
      adherencePercent,
    };
  });

  // Top Habit Streaks
  const topHabits: TopHabitStreak[] = habits.map((h) => {
    const currentStreak = calculateCurrentStreak(h.logs);
    const longestStreak = calculateLongestStreak(h.logs);
    const targetDays = Math.max(1, Math.min(7, h.targetDaysPerWeek || 7));
    const expected = interval.daysInRange * (targetDays / 7);
    const completedInRangeCount = h.logs.filter(
      (l) => l.completed && l.date >= startDateStr && l.date <= endDateStr
    ).length;
    const rate = expected > 0 ? Math.min(100, Math.round((completedInRangeCount / expected) * 100)) : 0;

    return {
      habitId: h.id,
      title: h.title,
      color: (h.color as ProjectColor) || "violet",
      icon: h.icon || "Repeat2",
      currentStreak,
      longestStreak,
      completionRate: rate,
    };
  }).sort((a, b) => b.currentStreak - a.currentStreak);

  const totalPossibleHabitLogs = habits.reduce((sum, h) => {
    const targetDays = Math.max(1, Math.min(7, h.targetDaysPerWeek || 7));
    return sum + interval.daysInRange * (targetDays / 7);
  }, 0);

  const overallHabitAdherenceRate =
    totalPossibleHabitLogs > 0
      ? Math.min(100, Math.round((completedLogsInRange.length / totalPossibleHabitLogs) * 100))
      : 0;

  // -------------------------------------------------------------------------
  // 6. Compute Overview KPIs with Previous-Period Comparisons
  // -------------------------------------------------------------------------
  const kpis: OverviewKPIs = {
    totalFocusMinutes: computeKPIMetric(
      currentFocusMinutes,
      prevFocusMinutes,
      "m",
      formatMinutesDisplay
    ),
    completedTasks: computeKPIMetric(
      totalCompletedCount,
      prevCompleted.length,
      "tasks"
    ),
    habitAdherenceRate: computeKPIMetric(
      overallHabitAdherenceRate,
      0, // Baseline comparison
      "%"
    ),
    estimationAccuracy: computeKPIMetric(
      estimationAccuracyPercent,
      100,
      "%"
    ),
  };

  // -------------------------------------------------------------------------
  // 7. Data-Aware Productivity Intelligence Generator
  // -------------------------------------------------------------------------
  const hasSufficientData =
    currentFocusMinutes > 0 || totalCompletedCount > 0 || completedLogsInRange.length > 0;

  const insights: ProductivityInsight[] = [];

  if (!hasSufficientData) {
    insights.push({
      id: "insight-welcome",
      type: "info",
      title: "Building Your Productivity Intelligence",
      description:
        "Execute focus blocks, complete project tasks, and log daily habits to populate peak productivity windows, estimation calibration, and consistency trends.",
      impact: "neutral",
      icon: "Sparkles",
    });
  } else {
    // Insight 1: Peak Focus Window
    const topBucket = [...timeOfDay].sort((a, b) => b.focusMinutes - a.focusMinutes)[0];
    if (topBucket && topBucket.focusMinutes > 0) {
      insights.push({
        id: "insight-peak-time",
        type: "peak_time",
        title: "Peak Deep Work Window",
        description: `You log ${topBucket.percentage}% of your deep work in the ${topBucket.label.toLowerCase()} (${topBucket.timeRange}). Schedule your highest-priority tasks during this high-energy window.`,
        metric: `${topBucket.percentage}% ${topBucket.label}`,
        impact: "positive",
        icon: "Sun",
      });
    }

    // Insight 2: Task Velocity Day of Week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    for (const t of completedInRange) {
      dayCounts[getDay(t.updatedAt)]++;
    }
    const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
    if (dayCounts[maxDayIdx] > 0) {
      insights.push({
        id: "insight-top-day",
        type: "velocity",
        title: "Highest Velocity Day",
        description: `${daysOfWeek[maxDayIdx]} is your most productive day for closing tasks, with ${dayCounts[maxDayIdx]} completed task${dayCounts[maxDayIdx] > 1 ? "s" : ""}.`,
        metric: `${daysOfWeek[maxDayIdx]}`,
        impact: "positive",
        icon: "TrendingUp",
      });
    }

    // Insight 3: Estimation Accuracy Calibration
    if (completedWithDurations.length >= 2) {
      const diffRatio = totalActMin / Math.max(1, totalEstMin);
      if (diffRatio <= 1.1 && diffRatio >= 0.9) {
        insights.push({
          id: "insight-estimation-good",
          type: "estimation",
          title: "Calibrated Time Estimation",
          description: `Your actual task duration aligns within ${estimationAccuracyPercent}% of your planned estimates. Excellent planning discipline!`,
          metric: `${estimationAccuracyPercent}% Accuracy`,
          impact: "positive",
          icon: "CheckCircle2",
        });
      } else if (diffRatio > 1.1) {
        const overPercent = Math.round((diffRatio - 1) * 100);
        insights.push({
          id: "insight-estimation-warn",
          type: "estimation",
          title: "Estimation Calibration Opportunity",
          description: `Tasks took approximately ${overPercent}% longer than originally estimated. Consider adding buffer time to your deadline planning.`,
          metric: `+${overPercent}% over est.`,
          impact: "warning",
          icon: "Clock",
        });
      }
    }

    // Insight 4: Habit Consistency Leader
    const topStreakHabit = topHabits.find((h) => h.currentStreak >= 3);
    if (topStreakHabit) {
      insights.push({
        id: "insight-habit-streak",
        type: "habit_consistency",
        title: "Habit Momentum Leader",
        description: `"${topStreakHabit.title}" is your strongest active habit with a ${topStreakHabit.currentStreak}-day consecutive streak!`,
        metric: `${topStreakHabit.currentStreak} Days`,
        impact: "positive",
        icon: "Flame",
      });
    }
  }

  const planningStats = await getPlanningStats(userId, interval.startDate ? new Date(interval.startDate) : new Date(0), new Date(interval.endDate));

  return {
    timeRange,
    interval,
    kpis,
    focus: {
      dailyTrend,
      byProject: projectAllocations.filter((p) => p.focusMinutes > 0),
      byMode,
      timeOfDay,
      totalFocusMinutes: currentFocusMinutes,
      totalBreakMinutes: currentBreakMinutes,
      completedSessionsCount: currentCompletedSessions,
    },
    tasks: {
      velocityTrend,
      byPriority,
      totalCreated: totalCreatedCount,
      totalCompleted: totalCompletedCount,
      overdueCount: overdueTasks.length,
      completionRate: taskCompletionRate,
      totalEstimatedMinutes: totalEstMin,
      totalActualMinutes: totalActMin,
    },
    habits: {
      dailyTrend: habitDailyTrend,
      byCategory,
      topHabits,
      overallAdherenceRate: overallHabitAdherenceRate,
      totalActiveHabits: totalHabitsCount,
    },
    projects: projectAllocations,
    planning: planningStats,
    insights,
    hasSufficientData,
  };
}
