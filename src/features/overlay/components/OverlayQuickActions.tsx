"use client";

import { Timer, Calendar, CheckSquare, Settings, LayoutDashboard } from "lucide-react";
import { openChronosRoute } from "../utils/navigation";
import { cn } from "@/lib/utils";

interface QuickActionItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

function QuickActionItem({ href, icon: Icon, label, color }: QuickActionItemProps) {
  return (
    <button
      type="button"
      onClick={() => openChronosRoute(href)}
      className="flex flex-col items-center justify-center p-2 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900/90 hover:border-white/20 transition-all text-center gap-1 group cursor-pointer"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <Icon className={cn("size-4 transition-transform group-hover:scale-110", color)} />
      <span className="text-[10px] font-semibold text-slate-400 group-hover:text-white truncate w-full">
        {label}
      </span>
    </button>
  );
}

export function OverlayQuickActions() {
  return (
    <div className="space-y-1.5 pt-1">
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
        QUICK NAVIGATION
      </span>
      <div className="grid grid-cols-5 gap-2">
        <QuickActionItem href="/focus" icon={Timer} label="Focus" color="text-violet-400" />
        <QuickActionItem href="/calendar" icon={Calendar} label="Calendar" color="text-blue-400" />
        <QuickActionItem href="/tasks" icon={CheckSquare} label="Tasks" color="text-emerald-400" />
        <QuickActionItem href="/settings" icon={Settings} label="Settings" color="text-amber-400" />
        <QuickActionItem href="/dashboard" icon={LayoutDashboard} label="App" color="text-slate-200" />
      </div>
    </div>
  );
}
