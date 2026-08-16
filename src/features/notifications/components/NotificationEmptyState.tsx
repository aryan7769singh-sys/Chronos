"use client";

import { BellOff } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="p-5 text-center space-y-2 border border-dashed border-white/10 rounded-xl bg-slate-900/40 backdrop-blur-sm select-none">
      <div className="size-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center mx-auto">
        <BellOff className="size-4" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-xs font-bold text-white">All Clear!</h4>
        <p className="text-[11px] text-slate-400">
          No notifications match your selected filter right now.
        </p>
      </div>
    </div>
  );
}
