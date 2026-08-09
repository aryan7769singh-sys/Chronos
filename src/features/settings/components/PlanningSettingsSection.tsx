"use client";

import { Calendar, Clock, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { PlanningSettings, CalendarViewPreference } from "../types";
import {
  CALENDAR_VIEW_OPTIONS,
  WEEK_START_OPTIONS,
  TIME_BLOCK_DURATION_OPTIONS,
} from "../constants/domain";

interface PlanningSettingsSectionProps {
  settings: PlanningSettings;
  onChange: (patch: Partial<PlanningSettings>) => void;
}

export function PlanningSettingsSection({
  settings,
  onChange,
}: PlanningSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Planning & Calendar Engine</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure default calendar view, first day of the week, standard time block duration, and working hours.
        </p>
      </div>

      {/* Calendar View & First Day */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Calendar className="size-4 text-violet-500" />
          Calendar Preferences
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Default view */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="plan-default-view" className="text-xs font-semibold text-foreground">
              Default Calendar View Mode
            </label>
            <select
              id="plan-default-view"
              value={settings.defaultCalendarView}
              onChange={(e) =>
                onChange({ defaultCalendarView: e.target.value as CalendarViewPreference })
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {CALENDAR_VIEW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Week starts on */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="plan-week-start" className="text-xs font-semibold text-foreground">
              First Day of the Week
            </label>
            <select
              id="plan-week-start"
              value={settings.weekStartsOn}
              onChange={(e) =>
                onChange({ weekStartsOn: (parseInt(e.target.value, 10) || 0) as 0 | 1 })
              }
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {WEEK_START_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Default Time Block Duration */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="size-4 text-emerald-500" />
          Time Block Scheduling Defaults
        </h3>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold text-foreground">Default Block Duration</span>
            <p className="text-[11px] text-muted-foreground">
              Pre-filled duration when creating a new time block from slot clicks or tasks.
            </p>
          </div>
          <select
            id="plan-default-duration"
            value={settings.defaultTimeBlockMinutes}
            onChange={(e) =>
              onChange({ defaultTimeBlockMinutes: parseInt(e.target.value, 10) || 60 })
            }
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {TIME_BLOCK_DURATION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Working Hours */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Briefcase className="size-4 text-blue-500" />
          Workday Schedule Hours
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="plan-workday-start" className="text-xs font-semibold text-foreground">
              Workday Start Time
            </label>
            <Input
              id="plan-workday-start"
              type="time"
              value={settings.workdayStart}
              onChange={(e) => onChange({ workdayStart: e.target.value })}
              className="h-9 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="plan-workday-end" className="text-xs font-semibold text-foreground">
              Workday End Time
            </label>
            <Input
              id="plan-workday-end"
              type="time"
              value={settings.workdayEnd}
              onChange={(e) => onChange({ workdayEnd: e.target.value })}
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
