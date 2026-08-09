"use client";

import { Bell, CheckCircle2, CalendarClock, Repeat, Timer, AlertCircle } from "lucide-react";
import type { NotificationSettings } from "../types";
import { cn } from "@/lib/utils";

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onChange: (patch: Partial<NotificationSettings>) => void;
}

interface ToggleRowProps {
  id: string;
  icon: React.ElementType;
  iconColor?: string;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}

function ToggleRow({
  id,
  icon: Icon,
  iconColor = "text-violet-500",
  title,
  description,
  checked,
  onToggle,
}: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-border/50 bg-card/30 hover:bg-card/60 transition-colors">
      <div className="flex items-start gap-3">
        <Icon className={cn("size-4 shrink-0 mt-0.5", iconColor)} />
        <div>
          <span className="text-xs font-semibold text-foreground">{title}</span>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

export function NotificationSettingsSection({
  settings,
  onChange,
}: NotificationSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Notification Preferences</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage system notification preferences for deadline alerts, focus sessions, time blocks, and habits.
        </p>
      </div>

      {/* Info notice */}
      <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Bell className="size-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Persistent Notification Architecture</span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            These preferences establish your persistent notification settings stored directly in Neon PostgreSQL. They govern both in-app focus/break chimes and future desktop push alerts.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <ToggleRow
          id="notif-deadline"
          icon={AlertCircle}
          iconColor="text-amber-500"
          title="Task Deadline Reminders"
          description="Receive warnings prior to upcoming task deadlines and overdue items."
          checked={settings.taskDeadlineReminders}
          onToggle={() => onChange({ taskDeadlineReminders: !settings.taskDeadlineReminders })}
        />

        <ToggleRow
          id="notif-timeblock"
          icon={CalendarClock}
          iconColor="text-violet-500"
          title="Time Block Start Reminders"
          description="Alerts 5 minutes before scheduled focus time blocks begin."
          checked={settings.timeBlockReminders}
          onToggle={() => onChange({ timeBlockReminders: !settings.timeBlockReminders })}
        />

        <ToggleRow
          id="notif-focus-completion"
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          title="Focus Session Completion"
          description="Audio and visual notifications when a Deep Work pomodoro timer reaches 0:00."
          checked={settings.focusCompletionNotifications}
          onToggle={() =>
            onChange({ focusCompletionNotifications: !settings.focusCompletionNotifications })
          }
        />

        <ToggleRow
          id="notif-break-completion"
          icon={Timer}
          iconColor="text-cyan-500"
          title="Break Completion Alerts"
          description="Chime when rest intervals end so you can resume work effortlessly."
          checked={settings.breakCompletionNotifications}
          onToggle={() =>
            onChange({ breakCompletionNotifications: !settings.breakCompletionNotifications })
          }
        />

        <ToggleRow
          id="notif-habits"
          icon={Repeat}
          iconColor="text-pink-500"
          title="Habit Consistency Reminders"
          description="Gentle daily prompts to log uncompleted active habits."
          checked={settings.habitReminders}
          onToggle={() => onChange({ habitReminders: !settings.habitReminders })}
        />

        <ToggleRow
          id="notif-daily-planning"
          icon={CalendarClock}
          iconColor="text-blue-500"
          title="Daily Planning Prompt"
          description="Morning recommendation to organize time blocks for the day ahead."
          checked={settings.dailyPlanningReminder}
          onToggle={() => onChange({ dailyPlanningReminder: !settings.dailyPlanningReminder })}
        />
      </div>
    </div>
  );
}
