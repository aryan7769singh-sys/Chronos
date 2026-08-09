"use client";

import { useEffect, useState } from "react";
import type { OverlayHUDData } from "../types";
import { OverlayHUD } from "./OverlayHUD";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { cn } from "@/lib/utils";
import { Monitor } from "lucide-react";

interface OverlayShellProps {
  data: OverlayHUDData;
}

export function OverlayShell({ data }: OverlayShellProps) {
  const [bgMode, setBgMode] = useState<"dark" | "glass" | "transparent">("dark");
  const { status, start, pause, reset, setZenMode, isZenMode } = useTimerStore();

  // Keyboard shortcut listener matching user settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") pause();
        else start();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setZenMode(!isZenMode);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, start, pause, reset, setZenMode, isZenMode]);

  return (
    <div
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden",
        bgMode === "dark" && "bg-slate-950 text-slate-100",
        bgMode === "glass" && "bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-slate-100",
        bgMode === "transparent" && "bg-transparent text-slate-100"
      )}
    >
      {/* Background wallpaper glow decorative elements */}
      {bgMode !== "transparent" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -left-40 size-96 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-blue-600/10 blur-3xl" />
        </div>
      )}

      {/* Floating HUD Card */}
      <main className="z-10 w-full flex flex-col items-center justify-center my-auto">
        <OverlayHUD data={data} />
      </main>

      {/* Development & Backdrop Preview Bar */}
      <footer className="z-10 mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-card/40 backdrop-blur-md text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-semibold text-foreground">
          <Monitor className="size-3.5 text-violet-400" />
          <span>Backdrop:</span>
        </span>
        <button
          type="button"
          onClick={() => setBgMode("dark")}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
            bgMode === "dark" ? "bg-primary text-primary-foreground font-bold" : "hover:text-foreground"
          )}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setBgMode("glass")}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
            bgMode === "glass" ? "bg-primary text-primary-foreground font-bold" : "hover:text-foreground"
          )}
        >
          Wallpaper
        </button>
        <button
          type="button"
          onClick={() => setBgMode("transparent")}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
            bgMode === "transparent" ? "bg-primary text-primary-foreground font-bold" : "hover:text-foreground"
          )}
        >
          Transparent (HUD Shell)
        </button>
      </footer>
    </div>
  );
}
