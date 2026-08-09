const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const WindowStateManager = require("./window-state");
const { createSystemTray } = require("./tray");
const {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
} = require("./shortcuts");

let mainWindow = null;
let windowStateManager = null;

const TARGET_URL = process.env.CHRONOS_URL || "http://localhost:3000/overlay";

function createWindow() {
  windowStateManager = new WindowStateManager(app.getPath("userData"));
  const savedState = windowStateManager.loadState();

  mainWindow = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: savedState.width || 420,
    height: savedState.height || 680,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
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

  mainWindow.loadURL(TARGET_URL);

  // Window state bounds persistence
  const saveBounds = () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      windowStateManager.saveState(mainWindow.getBounds());
    }
  };

  mainWindow.on("move", saveBounds);
  mainWindow.on("resize", saveBounds);

  // Prevent app exit on window close, hide to tray instead unless quitting
  mainWindow.on("close", (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  // Tray & Shortcuts setup
  createSystemTray(mainWindow, TARGET_URL);
  registerGlobalShortcuts(mainWindow);

  // IPC Handlers
  ipcMain.on("chronos:set-always-on-top", (_event, enabled) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(!!enabled);
    }
  });

  ipcMain.on("chronos:set-opacity", (_event, opacity) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const val = Math.max(0.2, Math.min(1.0, opacity / 100));
      mainWindow.setOpacity(val);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("will-quit", () => {
  unregisterGlobalShortcuts();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
