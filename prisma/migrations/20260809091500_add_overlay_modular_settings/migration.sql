-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN "overlayShowUrgentTasks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "overlayUrgentTaskCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "overlayShowNotifications" BOOLEAN NOT NULL DEFAULT true;
