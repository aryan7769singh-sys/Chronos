import type { OverlaySettings, OverlayPresetOption } from "@/features/settings/types";

export interface OverlayPresetDefinition {
  id: OverlayPresetOption;
  name: string;
  description: string;
  settings: Partial<OverlaySettings>;
}

export const OVERLAY_PRESETS: Record<OverlayPresetOption, OverlayPresetDefinition> = {
  minimal: {
    id: "minimal",
    name: "Minimal Clock",
    description: "Pure desktop countdown clock with zero surrounding visual noise.",
    settings: {
      overlayPreset: "minimal",
      overlayShowTimer: true,
      overlayShowCurrentTask: false,
      overlayShowUrgentTasks: false,
      overlayShowNextBlock: false,
      overlayShowProgress: false,
      overlayShowNotifications: false,
      overlayCompact: true,
    },
  },
  focus: {
    id: "focus",
    name: "Deep Focus",
    description: "Timer, active focus task, next block, and daily progress bar.",
    settings: {
      overlayPreset: "focus",
      overlayShowTimer: true,
      overlayShowCurrentTask: true,
      overlayShowNextBlock: true,
      overlayShowProgress: true,
      overlayShowUrgentTasks: false,
      overlayShowNotifications: false,
      overlayCompact: false,
    },
  },
  productivity: {
    id: "productivity",
    name: "Full Productivity",
    description: "Complete modular desktop suite with priorities and notifications.",
    settings: {
      overlayPreset: "productivity",
      overlayShowTimer: true,
      overlayShowCurrentTask: true,
      overlayShowUrgentTasks: true,
      overlayShowNextBlock: true,
      overlayShowProgress: true,
      overlayShowNotifications: true,
      overlayCompact: false,
    },
  },
  custom: {
    id: "custom",
    name: "Custom Workspace",
    description: "Individually configured module visibility and layout preferences.",
    settings: {
      overlayPreset: "custom",
    },
  },
};
