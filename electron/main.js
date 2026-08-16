const { app, BrowserWindow, ipcMain, Notification, shell } = require("electron");
const path = require("path");
const http = require("http");
const WindowStateManager = require("./window-state");
const { createSystemTray, logActionDiagnostics } = require("./tray");
const {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
} = require("./shortcuts");
const {
  configureWindowsStartup,
  checkWasOpenedAtLogin,
} = require("./startup");
const { debugLog } = require("./logger");

let mainWindow = null;
let windowStateManager = null;
let state = null;
let trayController = null;
let serverPollingTimer = null;
let isServerOnline = false;

const TARGET_URL = process.env.CHRONOS_URL || "http://localhost:3000/overlay";

const OFFLINE_HTML = `data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: rgba(15, 23, 42, 0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    color: #e2e8f0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    padding: 24px;
    user-select: none;
    -webkit-app-region: drag;
  }
  .pulse {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(59, 130, 246, 0.25);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
    margin-bottom: 14px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  h2 { font-size: 15px; font-weight: 600; color: #f8fafc; margin-bottom: 6px; letter-spacing: -0.01em; }
  p { font-size: 11px; color: #94a3b8; text-align: center; max-width: 240px; line-height: 1.5; margin-bottom: 16px; }
  .status { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #cbd5e1; margin-bottom: 14px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; animation: blink 1.5s infinite; }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .btn {
    padding: 7px 16px;
    background: #2563eb;
    color: white;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    -webkit-app-region: no-drag;
    border: none;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    transition: all 0.2s ease;
  }
  .btn:hover { background: #1d4ed8; }
</style>
</head>
<body>
  <div class="pulse"></div>
  <h2>Chronos Companion</h2>
  <div class="status"><span class="dot"></span> Waiting for Chronos server</div>
  <p>Looking for local app on localhost:3000. Start the Chronos web server to activate the HUD.</p>
  <button class="btn" onclick="window.location.href='http://localhost:3000/overlay'">Retry Connection</button>
</body>
</html>`)}`;

// ── Global Error Catching ──
process.on("uncaughtException", (err) => {
  debugLog("[Chronos DEBUG] UNCAUGHT EXCEPTION:", err && err.stack ? err.stack : err);
});

process.on("unhandledRejection", (reason) => {
  debugLog("[Chronos DEBUG] UNHANDLED REJECTION:", reason && reason.stack ? reason.stack : reason);
});

// ── Authoritative Window Helpers with Detailed Call Tracing ──

function showChronosWindow(source = "unknown") {
  debugLog(`[Chronos DEBUG] CALL showChronosWindow() source=${source}`);
  if (!mainWindow || mainWindow.isDestroyed()) {
    debugLog(`[Chronos DEBUG] showChronosWindow() aborted: window exists=${!!mainWindow}, destroyed=${mainWindow?.isDestroyed()}`);
    return;
  }

  const visibleBefore = mainWindow.isVisible();
  const minimizedBefore = mainWindow.isMinimized();
  debugLog(`[Chronos DEBUG] showChronosWindow() state before -> visible: ${visibleBefore}, minimized: ${minimizedBefore}, bounds: ${JSON.stringify(mainWindow.getBounds())}`);

  if (minimizedBefore) {
    debugLog("[Chronos DEBUG] CALL mainWindow.restore()");
    mainWindow.restore();
  }

  debugLog("[Chronos DEBUG] CALL mainWindow.show()");
  mainWindow.show();

  debugLog("[Chronos DEBUG] CALL mainWindow.focus()");
  mainWindow.focus();

  if (state && state.mode === "hud") {
    debugLog(`[Chronos DEBUG] CALL mainWindow.setAlwaysOnTop(${state.alwaysOnTop})`);
    mainWindow.setAlwaysOnTop(state.alwaysOnTop);
  }

  // If current URL is offline fallback or about:blank, trigger immediate check
  if (mainWindow.webContents) {
    const currentUrl = mainWindow.webContents.getURL();
    if (!currentUrl || currentUrl.startsWith("data:") || currentUrl === "about:blank") {
      debugLog("[Chronos DEBUG] showChronosWindow() checking server to load TARGET_URL...");
      checkSingleServerPing(TARGET_URL).then((online) => {
        if (online && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(TARGET_URL).catch(() => {});
        }
      });
    }
  }

  const visibleAfter = mainWindow.isVisible();
  const minimizedAfter = mainWindow.isMinimized();
  debugLog(`[Chronos DEBUG] showChronosWindow() state after -> visible: ${visibleAfter}, minimized: ${minimizedAfter}, bounds: ${JSON.stringify(mainWindow.getBounds())}`);
}

function hideChronosWindow(source = "unknown") {
  debugLog(`[Chronos DEBUG] CALL hideChronosWindow() source=${source}`);
  if (!mainWindow || mainWindow.isDestroyed()) {
    debugLog(`[Chronos DEBUG] hideChronosWindow() aborted: window exists=${!!mainWindow}, destroyed=${mainWindow?.isDestroyed()}`);
    return;
  }
  debugLog("[Chronos DEBUG] CALL mainWindow.hide()");
  mainWindow.hide();
  debugLog(`[Chronos DEBUG] hideChronosWindow() state after -> visible: ${mainWindow.isVisible()}`);
}

function setChronosMode(newMode, source = "unknown") {
  debugLog(`[Chronos DEBUG] CALL setChronosMode(${newMode}) source=${source}`);
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (newMode !== "hud" && newMode !== "widget") return;

  // 1. Save current bounds for old mode before switching
  const currentBounds = mainWindow.getBounds();
  if (state.mode === "hud") {
    state.hud = currentBounds;
  } else {
    state.widget = currentBounds;
  }

  // 2. Update in-memory mode
  state.mode = newMode;

  // 3. Persist mode through window-state mechanism
  windowStateManager.saveState(state);

  // 4. Apply correct BrowserWindow settings
  const targetBounds = state.mode === "widget" ? state.widget : state.hud;
  const isAlwaysOnTop = state.mode === "hud" ? state.alwaysOnTop : false;

  const newBounds = {
    x: typeof targetBounds.x === "number" ? targetBounds.x : currentBounds.x,
    y: typeof targetBounds.y === "number" ? targetBounds.y : currentBounds.y,
    width: typeof targetBounds.width === "number" ? targetBounds.width : (state.mode === "widget" ? 340 : 420),
    height: typeof targetBounds.height === "number" ? targetBounds.height : (state.mode === "widget" ? 380 : 680),
  };

  debugLog(`[Chronos DEBUG] setChronosMode applying newBounds: ${JSON.stringify(newBounds)}, isAlwaysOnTop: ${isAlwaysOnTop}`);
  mainWindow.setBounds(newBounds);
  mainWindow.setAlwaysOnTop(isAlwaysOnTop);

  // 5. Keep URL at /overlay & send IPC event to renderer
  if (mainWindow.webContents) {
    mainWindow.webContents.send("chronos:mode-changed", state.mode);
  }

  // 6. Restore & show window
  showChronosWindow(`setChronosMode(${newMode})`);

  if (trayController) trayController.updateContextMenu();
}

function setChronosAlwaysOnTop(enabled, source = "unknown") {
  debugLog(`[Chronos DEBUG] CALL setChronosAlwaysOnTop(${enabled}) source=${source}`);
  if (!mainWindow || mainWindow.isDestroyed()) return;
  state.alwaysOnTop = !!enabled;

  if (state.mode === "hud") {
    mainWindow.setAlwaysOnTop(state.alwaysOnTop);
  }

  windowStateManager.saveState(state);
  debugLog(`[Chronos DEBUG] setChronosAlwaysOnTop result -> isAlwaysOnTop(): ${mainWindow.isAlwaysOnTop()}`);

  if (trayController) trayController.updateContextMenu();
}

// ── Single Non-Crashing Server Ping ──
function checkSingleServerPing(url) {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (result) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    try {
      const req = http.get(url, (res) => {
        const ok = res.statusCode && res.statusCode >= 200 && res.statusCode < 500;
        debugLog(`[Chronos DEBUG] localhost:3000 available = ${ok} (status ${res.statusCode})`);
        finish(!!ok);
      });

      req.on("error", (err) => {
        debugLog(`[Chronos DEBUG] localhost:3000 available = false (error: ${err.message})`);
        finish(false);
      });

      req.setTimeout(1500, () => {
        try {
          req.destroy();
        } catch {
          // ignore
        }
        finish(false);
      });
    } catch {
      finish(false);
    }
  });
}

// ── Continuous Background Server Readiness Checker ──
function startBackgroundServerPolling(targetUrl) {
  if (serverPollingTimer) return;

  const poll = () => {
    checkSingleServerPing(targetUrl).then((online) => {
      if (online) {
        if (!isServerOnline) {
          isServerOnline = true;
          debugLog("[Chronos DEBUG] Local server detected online! Loading TARGET_URL in mainWindow");
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(targetUrl).catch((err) => {
              debugLog("[Chronos DEBUG] Failed to load TARGET_URL:", err);
            });
          }
        }
      } else {
        if (isServerOnline) {
          isServerOnline = false;
          debugLog("[Chronos DEBUG] Local server went offline.");
        }
      }
    });
  };

  serverPollingTimer = setInterval(poll, 3000);
}

function stopBackgroundServerPolling() {
  if (serverPollingTimer) {
    clearInterval(serverPollingTimer);
    serverPollingTimer = null;
  }
}

function createWindow() {
  debugLog("[Chronos DEBUG] createWindow() START");

  const cwd = process.cwd();
  const userDataPath = app.getPath("userData");
  windowStateManager = new WindowStateManager(userDataPath);
  state = windowStateManager.loadState();

  // Apply initial mode from startup preferences
  if (state.startupMode) {
    state.mode = state.startupMode;
  }

  const { wasOpenedAtLogin, wasOpenedAsHidden } = checkWasOpenedAtLogin();
  const launchedFromWindowsStartup =
    process.argv.includes("--hidden") ||
    process.argv.includes("--autostart") ||
    wasOpenedAtLogin;

  const shouldStartHidden = launchedFromWindowsStartup && state.launchMinimized;

  debugLog(`[Chronos DEBUG] app.isPackaged = ${app.isPackaged}`);
  debugLog(`[Chronos DEBUG] process.execPath = ${process.execPath}`);
  debugLog(`[Chronos DEBUG] process.argv = ${JSON.stringify(process.argv)}`);
  debugLog(`[Chronos DEBUG] cwd = ${cwd}`);
  debugLog(`[Chronos DEBUG] userData path = ${userDataPath}`);
  debugLog(`[Chronos DEBUG] wasOpenedAtLogin = ${wasOpenedAtLogin}`);
  debugLog(`[Chronos DEBUG] wasOpenedAsHidden = ${wasOpenedAsHidden}`);
  debugLog(`[Chronos DEBUG] launchOnStartup = ${state.launchOnStartup}`);
  debugLog(`[Chronos DEBUG] launchMinimized = ${state.launchMinimized}`);
  debugLog(`[Chronos DEBUG] startupMode = ${state.mode}`);
  debugLog(`[Chronos DEBUG] shouldStartHidden = ${shouldStartHidden}`);
  debugLog(`[Chronos DEBUG] launchedFromWindowsStartup = ${launchedFromWindowsStartup}`);

  // Ensure Windows startup registration status is in sync
  if (state.launchOnStartup !== undefined) {
    configureWindowsStartup({
      launchOnStartup: state.launchOnStartup,
      launchMinimized: state.launchMinimized,
      startupMode: state.mode,
    });
  }

  const initialBounds = state.mode === "widget" ? state.widget : state.hud;
  const isAlwaysOnTop = state.mode === "hud" ? state.alwaysOnTop : false;
  const initialWidth = initialBounds.width || (state.mode === "widget" ? 340 : 420);
  const initialHeight = initialBounds.height || (state.mode === "widget" ? 380 : 680);

  const windowOptions = {
    x: initialBounds.x,
    y: initialBounds.y,
    width: initialWidth,
    height: initialHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: isAlwaysOnTop,
    hasShadow: true,
    resizable: true,
    show: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  };

  debugLog(`[Chronos DEBUG] BrowserWindow constructor options: ${JSON.stringify({
    show: windowOptions.show,
    frame: windowOptions.frame,
    transparent: windowOptions.transparent,
    alwaysOnTop: windowOptions.alwaysOnTop,
    skipTaskbar: windowOptions.skipTaskbar,
    width: windowOptions.width,
    height: windowOptions.height,
  })}`);

  mainWindow = new BrowserWindow(windowOptions);

  debugLog("[Chronos DEBUG] BrowserWindow CREATED");
  debugLog(`[Chronos DEBUG] window.id = ${mainWindow.id}`);
  debugLog(`[Chronos DEBUG] window.isDestroyed() = ${mainWindow.isDestroyed()}`);
  debugLog(`[Chronos DEBUG] window.isVisible() = ${mainWindow.isVisible()}`);
  debugLog(`[Chronos DEBUG] window.isMinimized() = ${mainWindow.isMinimized()}`);
  debugLog(`[Chronos DEBUG] window.isMaximized() = ${mainWindow.isMaximized()}`);
  debugLog(`[Chronos DEBUG] window.getBounds() = ${JSON.stringify(mainWindow.getBounds())}`);

  // ── Web Contents Lifecycle Events ──

  mainWindow.webContents.on("did-start-loading", () => {
    debugLog("[Chronos DEBUG] EVENT did-start-loading");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    debugLog(`[Chronos DEBUG] EVENT did-finish-load -> url: ${mainWindow.webContents.getURL()}`);
  });

  mainWindow.webContents.on("did-fail-load", (_, errorCode, errorDescription, validatedURL) => {
    debugLog(`[Chronos DEBUG] EVENT did-fail-load -> errorCode: ${errorCode}, errorDescription: "${errorDescription}", validatedURL: "${validatedURL}"`);
    // If target URL failed to load, show offline placeholder and poll for server online
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.loadURL(OFFLINE_HTML).catch(() => {});
    }
  });

  mainWindow.webContents.on("dom-ready", () => {
    debugLog("[Chronos DEBUG] EVENT dom-ready");
  });

  mainWindow.webContents.on("render-process-gone", (_, details) => {
    debugLog(`[Chronos DEBUG] EVENT render-process-gone -> reason: ${details.reason}, exitCode: ${details.exitCode}`);
  });

  mainWindow.webContents.on("unresponsive", () => {
    debugLog("[Chronos DEBUG] EVENT unresponsive");
  });

  mainWindow.webContents.on("responsive", () => {
    debugLog("[Chronos DEBUG] EVENT responsive");
  });

  // ── BrowserWindow Lifecycle Events ──

  const logWindowState = (eventName) => {
    if (!mainWindow) {
      debugLog(`[Chronos DEBUG] EVENT ${eventName} -> mainWindow is null`);
      return;
    }
    const destroyed = mainWindow.isDestroyed();
    const visible = destroyed ? false : mainWindow.isVisible();
    const minimized = destroyed ? false : mainWindow.isMinimized();
    const bounds = destroyed ? null : mainWindow.getBounds();
    debugLog(`[Chronos DEBUG] EVENT ${eventName} -> visible: ${visible}, minimized: ${minimized}, destroyed: ${destroyed}, bounds: ${JSON.stringify(bounds)}`);
  };

  mainWindow.on("ready-to-show", () => {
    logWindowState("ready-to-show");
    if (!shouldStartHidden) {
      debugLog("[Chronos DEBUG] ready-to-show triggering showChronosWindow() (shouldStartHidden=false)");
      showChronosWindow("ready-to-show");
    } else {
      debugLog("[Chronos DEBUG] ready-to-show skipping showChronosWindow() (shouldStartHidden=true)");
    }
  });

  mainWindow.on("show", () => {
    logWindowState("show");
  });

  mainWindow.on("hide", () => {
    logWindowState("hide");
  });

  mainWindow.on("minimize", () => {
    logWindowState("minimize");
  });

  mainWindow.on("restore", () => {
    logWindowState("restore");
  });

  mainWindow.on("closed", () => {
    logWindowState("closed");
  });

  // Intercept link clicks
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    debugLog(`[Chronos DEBUG] Window open handler intercepted URL: ${url}`);
    try {
      shell.openExternal(url);
    } catch (err) {
      debugLog("[Chronos DEBUG] Failed to open external URL:", err);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url !== TARGET_URL && !url.includes("/overlay") && !url.startsWith("data:")) {
      event.preventDefault();
      debugLog(`[Chronos DEBUG] will-navigate intercepted URL: ${url}`);
      try {
        shell.openExternal(url);
      } catch (err) {
        debugLog("[Chronos DEBUG] Failed to open external URL:", err);
      }
    }
  });

  // Initial Load Sequence
  debugLog(`[Chronos DEBUG] Loading ${TARGET_URL}`);
  checkSingleServerPing(TARGET_URL).then((online) => {
    debugLog(`[Chronos DEBUG] Initial server ping result: ${online}`);
    if (online) {
      isServerOnline = true;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(TARGET_URL).then(() => {
          debugLog(`[Chronos DEBUG] loadURL resolved -> webContents.getURL() = ${mainWindow.webContents.getURL()}`);
          if (!shouldStartHidden) {
            showChronosWindow("loadURL.then");
          }
        }).catch((err) => {
          debugLog("[Chronos DEBUG] Failed to load URL:", err);
        });
      }
    } else {
      isServerOnline = false;
      debugLog("[Chronos DEBUG] Server is offline on startup. Loading offline placeholder screen.");
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.loadURL(OFFLINE_HTML).then(() => {
          debugLog("[Chronos DEBUG] Offline fallback loaded successfully.");
          if (!shouldStartHidden) {
            showChronosWindow("offlineFallback.loaded");
          }
        }).catch((err) => {
          debugLog("[Chronos DEBUG] Failed to load offline fallback:", err);
        });
      }
    }
  });

  // Start persistent background polling for when server becomes available
  startBackgroundServerPolling(TARGET_URL);

  // Window bounds persistence on move or resize
  const saveBounds = (eventSource) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds();
      logWindowState(eventSource);
      if (state.mode === "hud") {
        state.hud = bounds;
      } else {
        state.widget = bounds;
      }
      windowStateManager.saveState(state);
    }
  };

  mainWindow.on("move", () => saveBounds("move"));
  mainWindow.on("moved", () => saveBounds("moved"));
  mainWindow.on("resize", () => saveBounds("resize"));
  mainWindow.on("resized", () => saveBounds("resized"));

  // Hide to tray on close
  mainWindow.on("close", (e) => {
    logWindowState("close");
    if (!app.isQuitting) {
      e.preventDefault();
      debugLog("[Chronos DEBUG] close event intercepted -> calling hideChronosWindow()");
      hideChronosWindow("window.close.event");
      if (trayController) trayController.updateContextMenu();
    }
  });

  // System Tray setup with authoritative handlers
  trayController = createSystemTray(
    mainWindow,
    TARGET_URL,
    state,
    {
      showWindow: () => showChronosWindow("tray.handler.showWindow"),
      hideWindow: () => hideChronosWindow("tray.handler.hideWindow"),
      setMode: (mode) => setChronosMode(mode, "tray.handler.setMode"),
      setAlwaysOnTop: (enabled) => setChronosAlwaysOnTop(enabled, "tray.handler.setAlwaysOnTop"),
    }
  );

  // Global shortcuts setup (Ctrl+Shift+C, Ctrl+Shift+W, Ctrl+Shift+Space, Ctrl+Shift+R)
  registerGlobalShortcuts(mainWindow, () => {
    const nextMode = state.mode === "hud" ? "widget" : "hud";
    setChronosMode(nextMode, "globalShortcut.toggleMode");
  });

  // IPC Handlers
  ipcMain.on("chronos:minimize-window", () => {
    debugLog("[Chronos DEBUG] IPC chronos:minimize-window received");
    if (mainWindow && !mainWindow.isDestroyed()) {
      debugLog("[Chronos DEBUG] CALL mainWindow.minimize() source=ipcMain(chronos:minimize-window)");
      mainWindow.minimize();
    }
  });

  ipcMain.on("chronos:close-window", () => {
    debugLog("[Chronos DEBUG] IPC chronos:close-window received");
    hideChronosWindow("ipcMain(chronos:close-window)");
    if (trayController) trayController.updateContextMenu();
  });

  ipcMain.on("chronos:set-desktop-mode", (_event, mode) => {
    debugLog(`[Chronos DEBUG] IPC chronos:set-desktop-mode received -> mode: ${mode}`);
    setChronosMode(mode, "ipcMain(chronos:set-desktop-mode)");
  });

  ipcMain.on("chronos:set-always-on-top", (_event, enabled) => {
    debugLog(`[Chronos DEBUG] IPC chronos:set-always-on-top received -> enabled: ${enabled}`);
    setChronosAlwaysOnTop(enabled, "ipcMain(chronos:set-always-on-top)");
  });

  ipcMain.on("chronos:set-opacity", (_event, opacity) => {
    debugLog(`[Chronos DEBUG] IPC chronos:set-opacity received -> opacity: ${opacity}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      const val = Math.max(0.2, Math.min(1.0, opacity / 100));
      mainWindow.setOpacity(val);
      state.opacity = opacity;
      windowStateManager.saveState(state);
    }
  });

  ipcMain.on("chronos:set-startup-settings", (_event, { launchOnStartup, launchMinimized, startupMode }) => {
    debugLog(`[Chronos DEBUG] IPC chronos:set-startup-settings received -> ${JSON.stringify({ launchOnStartup, launchMinimized, startupMode })}`);
    if (typeof launchOnStartup === "boolean") {
      state.launchOnStartup = launchOnStartup;
    }
    if (typeof launchMinimized === "boolean") {
      state.launchMinimized = launchMinimized;
    }
    if (startupMode === "widget" || startupMode === "hud") {
      state.startupMode = startupMode;
    }

    windowStateManager.saveState(state);

    // Apply Windows startup registration update
    configureWindowsStartup({
      launchOnStartup: state.launchOnStartup,
      launchMinimized: state.launchMinimized,
      startupMode: state.startupMode,
    });
  });

  ipcMain.on("chronos:show-notification", (_event, { title, body }) => {
    try {
      if (Notification.isSupported()) {
        new Notification({
          title: title || "Chronos",
          body: body || "",
        }).show();
      }
    } catch {
      // ignore
    }
  });

  ipcMain.on("chronos:set-content-size", (_event, { width, height }) => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isMaximized()) {
      const currentBounds = mainWindow.getBounds();
      const targetWidth = typeof width === "number" ? Math.max(240, Math.min(600, Math.round(width))) : currentBounds.width;
      const targetHeight = typeof height === "number" ? Math.max(120, Math.min(900, Math.round(height))) : currentBounds.height;

      // Threshold check to avoid ResizeObserver infinite loops
      if (Math.abs(currentBounds.height - targetHeight) > 8 || Math.abs(currentBounds.width - targetWidth) > 8) {
        mainWindow.setSize(targetWidth, targetHeight, true);
        if (state.mode === "widget") {
          state.widget.width = targetWidth;
          state.widget.height = targetHeight;
        } else {
          state.hud.width = targetWidth;
          state.hud.height = targetHeight;
        }
        windowStateManager.saveState(state);
      }
    }
  });

  ipcMain.on("chronos:open-external", (_event, routeOrUrl) => {
    debugLog(`[Chronos DEBUG] IPC chronos:open-external received -> ${routeOrUrl}`);
    try {
      if (typeof routeOrUrl === "string" && routeOrUrl.length > 0) {
        const fullUrl = routeOrUrl.startsWith("http")
          ? routeOrUrl
          : `http://localhost:3000${routeOrUrl.startsWith("/") ? "" : "/"}${routeOrUrl}`;
        shell.openExternal(fullUrl);
      }
    } catch (err) {
      debugLog("[Chronos DEBUG] Failed to open external url:", err);
    }
  });
}

app.setName("ChronosHUD");

const gotTheLock = app.requestSingleInstanceLock();
debugLog(`[Chronos DEBUG] singleInstanceLock = ${gotTheLock}`);

if (!gotTheLock) {
  debugLog("[Chronos DEBUG] SECOND INSTANCE DETECTED -> calling app.quit()");
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine, workingDirectory) => {
    debugLog(`[Chronos DEBUG] EVENT second-instance -> commandLine: ${JSON.stringify(commandLine)}, workingDirectory: ${workingDirectory}`);
    showChronosWindow("second-instance");
  });

  app.whenReady().then(() => {
    debugLog("[Chronos DEBUG] app.whenReady() resolved");
    createWindow();

    app.on("activate", () => {
      debugLog("[Chronos DEBUG] EVENT activate");
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        showChronosWindow("app.activate");
      }
    });
  });
}

app.on("will-quit", () => {
  debugLog("[Chronos DEBUG] EVENT will-quit");
  stopBackgroundServerPolling();
  unregisterGlobalShortcuts();
});

app.on("window-all-closed", () => {
  debugLog("[Chronos DEBUG] EVENT window-all-closed");
  if (process.platform !== "darwin") {
    app.quit();
  }
});
