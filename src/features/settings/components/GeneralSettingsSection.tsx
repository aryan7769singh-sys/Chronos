"use client";

import { ShieldCheck, Mail, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GeneralSettingsSectionProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onReset: () => void;
  isResetting?: boolean;
}

export function GeneralSettingsSection({
  user,
  onReset,
  isResetting = false,
}: GeneralSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">General & Account</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your Chronos account identity and manage system configuration defaults.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name ?? "User"}
              className="size-12 rounded-full border border-border/60 object-cover"
            />
          ) : (
            <div className="size-12 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold text-lg">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                {user?.name ?? "Authenticated User"}
              </span>
              <Badge variant="outline" className="text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <ShieldCheck className="size-3 mr-1 inline" /> Active Session
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Mail className="size-3.5" />
              <span>{user?.email ?? "no-email@chronos.local"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Preferences & Information */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Identity & Security
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="text-muted-foreground font-medium">Tenant Isolation</span>
            <p className="text-foreground font-semibold">Strict Multi-Tenant Database</p>
            <p className="text-[11px] text-muted-foreground">
              Your records are strictly isolated and encrypted in Neon PostgreSQL.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 space-y-1">
            <span className="text-muted-foreground font-medium">Authentication</span>
            <p className="text-foreground font-semibold">Auth.js Session Token</p>
            <p className="text-[11px] text-muted-foreground">
              Authenticated securely via server-validated session credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Reset to Factory Defaults */}
      <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-3">
        <div className="flex items-center gap-2 text-destructive">
          <KeyRound className="size-4" />
          <h3 className="text-sm font-bold">Reset Personalization Defaults</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Reset all personalization options (Appearance, Focus timer, Planning, Notifications, and Keyboard Shortcuts) to their default Chronos values. Your projects, tasks, notes, and history will remain untouched.
        </p>
        <Button
          id="reset-settings-btn"
          size="sm"
          variant="destructive"
          onClick={onReset}
          disabled={isResetting}
          className="gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={isResetting ? "size-3.5 animate-spin" : "size-3.5"} />
          {isResetting ? "Resetting..." : "Reset All Settings to Defaults"}
        </Button>
      </div>
    </div>
  );
}
