const { Tray, Menu, nativeImage, app, shell } = require("electron");
const { debugLog } = require("./logger");

let tray = null;

function getTrayIcon() {
  const size = 32;
  const buffer = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = 13;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= radius) {
        // Chronos blue circle (#2563eb)
        buffer[idx] = 37;      // R
        buffer[idx + 1] = 99;  // G
        buffer[idx + 2] = 235; // B
        buffer[idx + 3] = 255; // A

        // Clock center and hands in crisp white (#ffffff)
        const inVerticalHand = Math.abs(dx) <= 1.5 && dy <= 1 && dy >= -8;
        const inHorizontalHand = Math.abs(dy) <= 1.5 && dx >= -1 && dx <= 6;
        if (inVerticalHand || inHorizontalHand) {
          buffer[idx] = 255;
          buffer[idx + 1] = 255;
          buffer[idx + 2] = 255;
          buffer[idx + 3] = 255;
        }
      } else {
        // Transparent outside
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
      }
    }
  }

  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function logActionDiagnostics(actionTag, mainWindow, state) {
  const exists = !!mainWindow;
  const isDestroyed = exists ? mainWindow.isDestroyed() : true;
  const isVisible = exists && !isDestroyed ? mainWindow.isVisible() : false;
  const isMinimized = exists && !isDestroyed ? mainWindow.isMinimized() : false;
  const isMaximized = exists && !isDestroyed ? mainWindow.isMaximized() : false;
  const isAlwaysOnTop = exists && !isDestroyed ? mainWindow.isAlwaysOnTop() : false;
  const bounds = exists && !isDestroyed ? mainWindow.getBounds() : null;
  const url = exists && !isDestroyed && mainWindow.webContents ? mainWindow.webContents.getURL() : "N/A";
  const currentMode = state ? state.mode : "unknown";

  debugLog(`[Chronos DEBUG] TRAY ${actionTag}`);
  debugLog(`  - mainWindow Exists: ${exists}`);
  debugLog(`  - mainWindow.isDestroyed(): ${isDestroyed}`);
  debugLog(`  - mainWindow.isVisible(): ${isVisible}`);
  debugLog(`  - mainWindow.isMinimized(): ${isMinimized}`);
  debugLog(`  - mainWindow.isMaximized(): ${isMaximized}`);
  debugLog(`  - mainWindow.isAlwaysOnTop(): ${isAlwaysOnTop}`);
  debugLog(`  - mainWindow.getBounds(): ${bounds ? JSON.stringify(bounds) : "N/A"}`);
  debugLog(`  - currentMode: ${currentMode}`);
  debugLog(`  - current URL: ${url}`);
}

function createSystemTray(
  mainWindow,
  targetUrl,
  currentState,
  handlers
) {
  const icon = getTrayIcon();

  tray = new Tray(icon);
  tray.setToolTip("Chronos Desktop Companion");

  const getBaseUrl = () => {
    try {
      const parsed = new URL(targetUrl);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return "http://localhost:3000";
    }
  };

  const updateContextMenu = () => {
    const exists = mainWindow && !mainWindow.isDestroyed();
    const isVisible = exists && mainWindow.isVisible();
    const currentMode = currentState ? currentState.mode : "widget";
    const isAlwaysOnTop = currentState ? currentState.alwaysOnTop : true;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? "Hide Window" : "Show Window",
        click: () => {
          if (isVisible) {
            debugLog("[Chronos DEBUG] TRAY HIDE WINDOW clicked");
            logActionDiagnostics("HIDE WINDOW", mainWindow, currentState);
            if (handlers && handlers.hideWindow) handlers.hideWindow();
          } else {
            debugLog("[Chronos DEBUG] TRAY SHOW WINDOW clicked");
            debugLog(`[Chronos DEBUG] window exists = ${exists}`);
            debugLog(`[Chronos DEBUG] destroyed = ${exists ? mainWindow.isDestroyed() : true}`);
            debugLog(`[Chronos DEBUG] visible before = ${exists ? mainWindow.isVisible() : false}`);
            debugLog(`[Chronos DEBUG] minimized before = ${exists ? mainWindow.isMinimized() : false}`);
            debugLog(`[Chronos DEBUG] bounds before = ${exists ? JSON.stringify(mainWindow.getBounds()) : "null"}`);

            debugLog("[Chronos DEBUG] calling restore()");
            debugLog("[Chronos DEBUG] calling show()");
            if (handlers && handlers.showWindow) handlers.showWindow();

            debugLog(`[Chronos DEBUG] visible after = ${exists ? mainWindow.isVisible() : false}`);
            debugLog(`[Chronos DEBUG] minimized after = ${exists ? mainWindow.isMinimized() : false}`);
          }
          updateContextMenu();
        },
      },
      {
        label: currentMode === "hud" ? "✓ Floating HUD Mode" : "Switch to Floating HUD",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY SWITCH TO FLOATING HUD clicked");
          logActionDiagnostics("SWITCH_HUD", mainWindow, currentState);
          if (handlers && handlers.setMode) handlers.setMode("hud");
          updateContextMenu();
        },
      },
      {
        label: currentMode === "widget" ? "✓ Desktop Widget Mode" : "Switch to Desktop Widget",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY SWITCH TO DESKTOP WIDGET clicked");
          logActionDiagnostics("SWITCH_WIDGET", mainWindow, currentState);
          if (handlers && handlers.setMode) handlers.setMode("widget");
          updateContextMenu();
        },
      },
      {
        label: isAlwaysOnTop ? "✓ Always on Top" : "Always on Top",
        type: "checkbox",
        checked: isAlwaysOnTop,
        click: () => {
          debugLog(`[Chronos DEBUG] TRAY TOGGLE ALWAYS ON TOP clicked (new value: ${!isAlwaysOnTop})`);
          logActionDiagnostics("TOGGLE_ALWAYS_ON_TOP", mainWindow, currentState);
          if (handlers && handlers.setAlwaysOnTop) handlers.setAlwaysOnTop(!isAlwaysOnTop);
          updateContextMenu();
        },
      },
      { type: "separator" },
      {
        label: "Open Focus",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY ACTION: Open Focus");
          const baseUrl = getBaseUrl();
          const target = `${baseUrl}/focus`;
          debugLog(`[Chronos DEBUG] Opening external browser URL: ${target}`);
          try {
            shell.openExternal(target);
          } catch (err) {
            debugLog("[Chronos DEBUG] Failed to open external URL:", err);
          }
        },
      },
      {
        label: "Open Dashboard",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY ACTION: Open Dashboard");
          const baseUrl = getBaseUrl();
          const target = `${baseUrl}/dashboard`;
          debugLog(`[Chronos DEBUG] Opening external browser URL: ${target}`);
          try {
            shell.openExternal(target);
          } catch (err) {
            debugLog("[Chronos DEBUG] Failed to open external URL:", err);
          }
        },
      },
      {
        label: "Open Settings",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY ACTION: Open Settings");
          const baseUrl = getBaseUrl();
          const target = `${baseUrl}/settings`;
          debugLog(`[Chronos DEBUG] Opening external browser URL: ${target}`);
          try {
            shell.openExternal(target);
          } catch (err) {
            debugLog("[Chronos DEBUG] Failed to open external URL:", err);
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit Chronos",
        click: () => {
          debugLog("[Chronos DEBUG] TRAY ACTION: Quit Chronos");
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
  };

  updateContextMenu();

  tray.on("click", () => {
    debugLog("[Chronos DEBUG] TRAY LEFT-CLICK (RESTORE/SHOW)");
    logActionDiagnostics("RESTORE", mainWindow, currentState);
    if (handlers && handlers.showWindow) {
      handlers.showWindow();
    }
    updateContextMenu();
  });

  tray.on("right-click", () => {
    updateContextMenu();
  });

  return {
    tray,
    updateContextMenu,
  };
}

module.exports = { createSystemTray, logActionDiagnostics };
