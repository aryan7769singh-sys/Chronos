const { globalShortcut } = require("electron");
const { debugLog } = require("./logger");

function registerGlobalShortcuts(mainWindow, onToggleMode) {
  try {
    // Toggle HUD visibility (Ctrl+Shift+C)
    globalShortcut.register("CommandOrControl+Shift+C", () => {
      debugLog("[Chronos DEBUG] SHORTCUT CommandOrControl+Shift+C triggered");
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isVisible()) {
          debugLog("[Chronos DEBUG] CALL mainWindow.hide() source=globalShortcut(Ctrl+Shift+C)");
          mainWindow.hide();
        } else {
          debugLog("[Chronos DEBUG] CALL mainWindow.show() source=globalShortcut(Ctrl+Shift+C)");
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    // Toggle Desktop Widget / HUD mode (Ctrl+Shift+W)
    globalShortcut.register("CommandOrControl+Shift+W", () => {
      debugLog("[Chronos DEBUG] SHORTCUT CommandOrControl+Shift+W triggered");
      if (typeof onToggleMode === "function") {
        onToggleMode();
      }
    });

    // Toggle Play/Pause Focus timer (Ctrl+Shift+Space)
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
      debugLog("[Chronos DEBUG] SHORTCUT CommandOrControl+Shift+Space triggered");
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("chronos:shortcut-action", "toggle-timer");
      }
    });

    // Reset Focus timer (Ctrl+Shift+R)
    globalShortcut.register("CommandOrControl+Shift+R", () => {
      debugLog("[Chronos DEBUG] SHORTCUT CommandOrControl+Shift+R triggered");
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("chronos:shortcut-action", "reset-timer");
      }
    });
  } catch (err) {
    debugLog("[Chronos DEBUG] Shortcut registration error:", err);
  }
}

function unregisterGlobalShortcuts() {
  try {
    globalShortcut.unregisterAll();
  } catch {
    // ignore
  }
}

module.exports = {
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
};
