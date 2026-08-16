"use client";

/**
 * Safely opens a Chronos application route.
 * When running in the Electron desktop overlay, opens the full page in the default web browser
 * to keep the Desktop Widget / HUD transparent and undisturbed.
 * When running in a standard browser tab, performs client navigation.
 */
export function openChronosRoute(route: string) {
  if (typeof window === "undefined") return;

  const win = window as unknown as {
    chronosDesktop?: { openExternal?: (path: string) => void };
  };

  if (win.chronosDesktop?.openExternal) {
    win.chronosDesktop.openExternal(route);
  } else {
    window.location.href = route;
  }
}
