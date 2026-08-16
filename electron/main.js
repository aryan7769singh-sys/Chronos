const { app, BrowserWindow, ipcMain, Notification, shell } = require("electron");
const path = require("path");
const WindowStateManager = require("./window-state");
const { createSystemTray } = require("./tray");
const {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
} = require("./shortcuts");

let mainWindow = null;
let windowStateManager = null;
let state = null;
let trayController = null;

const TARGET_URL = process.env.CHRONOS_URL || "http://localhost:3000/overlay";

function switchMode(newMode) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  // Save current bounds for old mode
  const currentBounds = mainWindow.getBounds();
  if (state.mode === "hud") {
    state.hud = currentBounds;
  } else {
    state.widget = currentBounds;
  }

  state.mode = newMode === "widget" ? "widget" : "hud";

  // Apply new mode bounds & always-on-top level
  const targetBounds = state.mode === "widget" ? state.widget : state.hud;
  const isAlwaysOnTop = state.mode === "hud" ? state.alwaysOnTop : false;

  const newBounds = {
    x: typeof targetBounds.x === "number" ? targetBounds.x : currentBounds.x,
    y: typeof targetBounds.y === "number" ? targetBounds.y : currentBounds.y,
    width: typeof targetBounds.width === "number" ? targetBounds.width : (state.mode === "widget" ? 340 : 420),
    height: typeof targetBounds.height === "number" ? targetBounds.height : (state.mode === "widget" ? 380 : 680),
  };

  mainWindow.setBounds(newBounds);
  mainWindow.setAlwaysOnTop(isAlwaysOnTop);
  mainWindow.webContents.send("chronos:mode-changed", state.mode);

  windowStateManager.saveState(state);
  if (trayController) trayController.updateContextMenu();
}

function toggleAlwaysOnTop(enabled) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  state.alwaysOnTop = !!enabled;
  if (state.mode === "hud") {
    mainWindow.setAlwaysOnTop(state.alwaysOnTop);
  }
  windowStateManager.saveState(state);
  if (trayController) trayController.updateContextMenu();
}

function createWindow() {
  windowStateManager = new WindowStateManager(app.getPath("userData"));
  state = windowStateManager.loadState();

  const initialBounds = state.mode === "widget" ? state.widget : state.hud;
  const isAlwaysOnTop = state.mode === "hud" ? state.alwaysOnTop : false;

  mainWindow = new BrowserWindow({
    x: initialBounds.x,
    y: initialBounds.y,
    width: initialBounds.width || (state.mode === "widget" ? 340 : 420),
    height: initialBounds.height || (state.mode === "widget" ? 380 : 680),
    frame: false,
    transparent: true,
    alwaysOnTop: isAlwaysOnTop,
    hasShadow: true,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // Intercept any link clicks to open full pages in default browser instead of replacing overlay
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      shell.openExternal(url);
    } catch {
      // ignore
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    // If attempting to navigate away from the overlay URL, open externally instead
    if (url !== TARGET_URL && !url.includes("/overlay")) {
      event.preventDefault();
      try {
        shell.openExternal(url);
      } catch {
        // ignore
      }
    }
  });

  function tryLoad() {
    mainWindow.loadURL(TARGET_URL).catch(() => {
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          tryLoad();
        }
      }, 2000);
    });
  }
  tryLoad();

  // Window bounds persistence on move or resize
  const saveBounds = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const bounds = mainWindow.getBounds();
      if (state.mode === "hud") {
        state.hud = bounds;
      } else {
        state.widget = bounds;
      }
      windowStateManager.saveState(state);
    }
  };

  mainWindow.on("move", saveBounds);
  mainWindow.on("moved", saveBounds);
  mainWindow.on("resize", saveBounds);
  mainWindow.on("resized", saveBounds);


  // Hide to tray on close
  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
      if (trayController) trayController.updateContextMenu();
    }
  });

  // System Tray setup
  trayController = createSystemTray(
    mainWindow,
    TARGET_URL,
    state,
    (mode) => switchMode(mode),
    (alwaysOnTop) => toggleAlwaysOnTop(alwaysOnTop)
  );

  // Global shortcuts setup (Ctrl+Shift+C, Ctrl+Shift+W, Ctrl+Shift+Space, Ctrl+Shift+R)
  registerGlobalShortcuts(mainWindow, () => {
    const nextMode = state.mode === "hud" ? "widget" : "hud";
    switchMode(nextMode);
  });

  // IPC Handlers
  ipcMain.on("chronos:minimize-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on("chronos:close-window", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide();
      if (trayController) trayController.updateContextMenu();
    }
  });

  ipcMain.on("chronos:set-desktop-mode", (_event, mode) => {
    switchMode(mode);
  });

  ipcMain.on("chronos:set-always-on-top", (_event, enabled) => {
    toggleAlwaysOnTop(enabled);
  });

  ipcMain.on("chronos:set-opacity", (_event, opacity) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const val = Math.max(0.2, Math.min(1.0, opacity / 100));
      mainWindow.setOpacity(val);
    }
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
      const targetWidth = typeof width === "number" ? Math.max(260, Math.min(600, Math.round(width))) : currentBounds.width;
      const targetHeight = typeof height === "number" ? Math.max(120, Math.min(900, Math.round(height))) : currentBounds.height;
      if (Math.abs(currentBounds.height - targetHeight) > 5 || Math.abs(currentBounds.width - targetWidth) > 5) {
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
    try {
      if (typeof routeOrUrl === "string" && routeOrUrl.length > 0) {
        const fullUrl = routeOrUrl.startsWith("http")
          ? routeOrUrl
          : `http://localhost:3000${routeOrUrl.startsWith("/") ? "" : "/"}${routeOrUrl}`;
        shell.openExternal(fullUrl);
      }
    } catch (err) {
      console.error("Failed to open external url:", err);
    }
  });
}



app.setName("ChronosHUD");

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on("will-quit", () => {
  unregisterGlobalShortcuts();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

