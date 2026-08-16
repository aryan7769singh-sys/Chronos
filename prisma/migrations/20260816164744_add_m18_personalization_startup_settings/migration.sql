-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "launchMinimized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "launchOnStartup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overlayBlur" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "overlayBorder" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "overlayDensity" TEXT NOT NULL DEFAULT 'comfortable',
ADD COLUMN     "overlayPreset" TEXT NOT NULL DEFAULT 'custom',
ADD COLUMN     "overlayTimerGlow" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "overlayTimerSize" TEXT NOT NULL DEFAULT 'large',
ADD COLUMN     "overlayTimerWeight" TEXT NOT NULL DEFAULT 'bold',
ADD COLUMN     "startupMode" TEXT NOT NULL DEFAULT 'widget';
