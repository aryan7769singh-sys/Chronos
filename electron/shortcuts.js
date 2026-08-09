const { globalShortcut } = require("electron");

function registerGlobalShortcuts(mainWindow) {
  try {
    // Toggle HUD visibility (Ctrl+Shift+C)
    globalShortcut.register("CommandOrControl+Shift+C", () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Toggle Play/Pause Focus timer (Ctrl+Shift+Space)
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("chronos:shortcut-action", "toggle-timer");
      }
    });

    // Reset Focus timer (Ctrl+Shift+R)
    globalShortcut.register("CommandOrControl+Shift+R", () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("chronos:shortcut-action", "reset-timer");
      }
    });
  } catch {
    // Gracefully handle registration failure on non-supported desktop environments
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
