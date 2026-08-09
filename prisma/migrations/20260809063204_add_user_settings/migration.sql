-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "accentColor" TEXT NOT NULL DEFAULT 'violet',
    "uiDensity" TEXT NOT NULL DEFAULT 'comfortable',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "pomodoroMinutes" INTEGER NOT NULL DEFAULT 25,
    "shortBreakMinutes" INTEGER NOT NULL DEFAULT 5,
    "longBreakMinutes" INTEGER NOT NULL DEFAULT 15,
    "pomodoroCycles" INTEGER NOT NULL DEFAULT 4,
    "autoStartBreaks" BOOLEAN NOT NULL DEFAULT false,
    "autoStartWork" BOOLEAN NOT NULL DEFAULT false,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "soundVolume" INTEGER NOT NULL DEFAULT 80,
    "soundTheme" TEXT NOT NULL DEFAULT 'chime',
    "defaultCalendarView" TEXT NOT NULL DEFAULT 'month',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 0,
    "defaultTimeBlockMinutes" INTEGER NOT NULL DEFAULT 60,
    "workdayStart" TEXT NOT NULL DEFAULT '09:00',
    "workdayEnd" TEXT NOT NULL DEFAULT '17:00',
    "taskDeadlineReminders" BOOLEAN NOT NULL DEFAULT true,
    "timeBlockReminders" BOOLEAN NOT NULL DEFAULT true,
    "focusCompletionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "breakCompletionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "habitReminders" BOOLEAN NOT NULL DEFAULT true,
    "dailyPlanningReminder" BOOLEAN NOT NULL DEFAULT true,
    "overlayEnabled" BOOLEAN NOT NULL DEFAULT true,
    "overlayOpacity" INTEGER NOT NULL DEFAULT 90,
    "overlayCompact" BOOLEAN NOT NULL DEFAULT false,
    "overlayShowCurrentTask" BOOLEAN NOT NULL DEFAULT true,
    "overlayShowTimer" BOOLEAN NOT NULL DEFAULT true,
    "overlayShowNextBlock" BOOLEAN NOT NULL DEFAULT true,
    "overlayShowProgress" BOOLEAN NOT NULL DEFAULT true,
    "customShortcuts" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
