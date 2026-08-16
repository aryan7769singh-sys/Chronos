interface ChronosDesktopWindow {
  chronosDesktop?: {
    showNotification?: (input: { title: string; body: string }) => void;
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Electron shell automatically has native notification privileges
  if ((window as unknown as ChronosDesktopWindow).chronosDesktop) {
    return true;
  }

  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showSystemNotification(title: string, message: string): void {
  if (typeof window === "undefined") return;

  const win = window as unknown as ChronosDesktopWindow;

  // 1. Electron Native Notification via Preload IPC
  if (win.chronosDesktop?.showNotification) {
    win.chronosDesktop.showNotification({
      title,
      body: message,
    });
    return;
  }

  // 2. Web Browser Notification API
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, {
        body: message,
        icon: "/favicon.ico",
      });
    } catch {
      // ignore
    }
  }
}

