"use client";

import Link from "next/link";
import { Timer, Calendar, CheckSquare, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

function QuickActionItem({ href, icon: Icon, label, color }: QuickActionItemProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-2 rounded-xl border border-border/40 bg-card/40 hover:bg-card/80 hover:border-border transition-all text-center gap-1 group"
    >
      <Icon className={cn("size-4 transition-transform group-hover:scale-110", color)} />
      <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-foreground truncate w-full">
        {label}
      </span>
    </Link>
  );
}

export function OverlayQuickActions() {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
        QUICK NAVIGATION
      </span>
      <div className="grid grid-cols-5 gap-2">
        <QuickActionItem href="/focus" icon={Timer} label="Focus" color="text-violet-500" />
        <QuickActionItem href="/calendar" icon={Calendar} label="Calendar" color="text-blue-500" />
        <QuickActionItem href="/tasks" icon={CheckSquare} label="Tasks" color="text-emerald-500" />
        <QuickActionItem href="/settings" icon={Settings} label="Settings" color="text-amber-500" />
        <QuickActionItem href="/dashboard" icon={LayoutDashboard} label="App" color="text-foreground" />
      </div>
    </div>
  );
}
