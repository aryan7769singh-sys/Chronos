"use client";

import { Clock } from "lucide-react";

export function FutureScreenTimeModule() {
  return (
    <div className="p-2.5 rounded-xl border border-dashed border-border/60 bg-card/20 backdrop-blur-sm space-y-1 select-none text-center">
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <Clock className="size-3 text-violet-400" />
        <span>SCREEN TIME &amp; DIGITAL HABITS</span>
        <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
          COMING SOON
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground/80 leading-tight">
        Application usage insights and digital habit analytics.
      </p>
    </div>
  );
}
