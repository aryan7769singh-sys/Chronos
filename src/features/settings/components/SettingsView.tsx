"use client";

import { useState, useTransition } from "react";
import {
  User,
  Palette,
  Timer,
  Calendar,
  Bell,
  Monitor,
  Command,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { UserSettings, UpdateSettingsInput } from "../types";
import {
  updateUserSettingsAction,
  resetUserSettingsAction,
} from "../actions";
import { GeneralSettingsSection } from "./GeneralSettingsSection";
import { AppearanceSettingsSection } from "./AppearanceSettingsSection";
import { FocusSettingsSection } from "./FocusSettingsSection";
import { PlanningSettingsSection } from "./PlanningSettingsSection";
import { NotificationSettingsSection } from "./NotificationSettingsSection";
import { OverlaySettingsSection } from "./OverlaySettingsSection";
import { ShortcutsSettingsSection } from "./ShortcutsSettingsSection";
import { cn } from "@/lib/utils";

type SettingsTab =
  | "general"
  | "appearance"
  | "focus"
  | "planning"
  | "notifications"
  | "overlay"
  | "shortcuts";

interface SettingsViewProps {
  initialSettings: UserSettings;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const TAB_NAV: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General & Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "focus", label: "Focus & Deep Work", icon: Timer },
  { id: "planning", label: "Planning & Calendar", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "overlay", label: "Desktop Overlay", icon: Monitor },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Command },
];

export function SettingsView({ initialSettings, user }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset Modal state
  const [showResetModal, setShowResetModal] = useState(false);

  const applyUpdate = (patch: UpdateSettingsInput) => {
    // Optimistic state update
    setSettings((prev) => ({
      ...prev,
      appearance: patch.appearance ? { ...prev.appearance, ...patch.appearance } : prev.appearance,
      focus: patch.focus ? { ...prev.focus, ...patch.focus } : prev.focus,
      planning: patch.planning ? { ...prev.planning, ...patch.planning } : prev.planning,
      notifications: patch.notifications
        ? { ...prev.notifications, ...patch.notifications }
        : prev.notifications,
      overlay: patch.overlay ? { ...prev.overlay, ...patch.overlay } : prev.overlay,
      shortcuts: patch.customShortcuts
        ? prev.shortcuts.map((s) => (s.editable && patch.customShortcuts![s.id] ? { ...s, key: patch.customShortcuts![s.id] } : s))
        : prev.shortcuts,
    }));

    setSaveStatus("idle");

    startTransition(async () => {
      try {
        const updated = await updateUserSettingsAction(patch);
        setSettings(updated);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err: unknown) {
        setSaveStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to persist settings.");
      }
    });
  };

  const handleResetConfirm = () => {
    setShowResetModal(false);
    startTransition(async () => {
      try {
        const reset = await resetUserSettingsAction();
        setSettings(reset);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err: unknown) {
        setSaveStatus("error");
        setErrorMessage(err instanceof Error ? err.message : "Failed to reset settings.");
      }
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Top Header & Save Status Indicator */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border/50">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-violet-500" />
            <span>Settings &amp; Personalization</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system defaults, focus intervals, calendar layout, audio alerts, and hotkeys.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isPending && (
            <span className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-medium animate-pulse">
              <Loader2 className="size-3.5 animate-spin" />
              Saving changes...
            </span>
          )}
          {saveStatus === "saved" && !isPending && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3.5" />
              Settings saved
            </span>
          )}
          {saveStatus === "error" && !isPending && (
            <span className="flex items-center gap-1.5 text-xs text-destructive font-medium">
              <AlertCircle className="size-3.5" />
              {errorMessage ?? "Save failed"}
            </span>
          )}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Navigation Sidebar */}
        <nav className="flex flex-col gap-1 bg-card/40 p-1.5 rounded-xl border border-border/60">
          {TAB_NAV.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`settings-tab-${tab.id}`}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Pane */}
        <div className="p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs min-h-[500px]">
          {activeTab === "general" && (
            <GeneralSettingsSection
              user={user}
              onReset={() => setShowResetModal(true)}
              isResetting={isPending}
            />
          )}

          {activeTab === "appearance" && (
            <AppearanceSettingsSection
              settings={settings.appearance}
              onChange={(patch) => applyUpdate({ appearance: patch })}
            />
          )}

          {activeTab === "focus" && (
            <FocusSettingsSection
              settings={settings.focus}
              onChange={(patch) => applyUpdate({ focus: patch })}
            />
          )}

          {activeTab === "planning" && (
            <PlanningSettingsSection
              settings={settings.planning}
              onChange={(patch) => applyUpdate({ planning: patch })}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationSettingsSection
              settings={settings.notifications}
              onChange={(patch) => applyUpdate({ notifications: patch })}
            />
          )}

          {activeTab === "overlay" && (
            <OverlaySettingsSection
              settings={settings.overlay}
              onChange={(patch) => applyUpdate({ overlay: patch })}
            />
          )}

          {activeTab === "shortcuts" && (
            <ShortcutsSettingsSection
              shortcuts={settings.shortcuts}
              onChange={(customShortcuts) => applyUpdate({ customShortcuts })}
            />
          )}
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="max-w-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Reset All Settings?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              This will restore all Chronos system defaults (Appearance, Focus durations, Planning defaults, Audio, Notifications, and Shortcuts). Your tasks, projects, notes, and focus history will not be lost.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex items-center justify-end gap-2">
            <Button
              id="confirm-reset-cancel"
              size="sm"
              variant="outline"
              onClick={() => setShowResetModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              id="confirm-reset-proceed"
              size="sm"
              variant="destructive"
              onClick={handleResetConfirm}
              className="text-xs font-semibold"
            >
              Reset to Defaults
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
