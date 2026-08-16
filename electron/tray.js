const { Tray, Menu, nativeImage, app } = require("electron");

let tray = null;

function createSystemTray(mainWindow, targetUrl, currentState, onSwitchMode, onToggleAlwaysOnTop) {
  const icon = nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip("Chronos Command HUD");

  const updateContextMenu = () => {
    const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
    const currentMode = currentState.mode;
    const isAlwaysOnTop = currentState.alwaysOnTop;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? "Hide Window" : "Show Window",
        click: () => {
          if (isVisible) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
          updateContextMenu();
        },
      },
      {
        label: currentMode === "hud" ? "✓ Floating HUD Mode" : "Switch to Floating HUD",
        click: () => {
          if (onSwitchMode) onSwitchMode("hud");
          updateContextMenu();
        },
      },
      {
        label: currentMode === "widget" ? "✓ Desktop Widget Mode" : "Switch to Desktop Widget",
        click: () => {
          if (onSwitchMode) onSwitchMode("widget");
          updateContextMenu();
        },
      },
      {
        label: isAlwaysOnTop ? "✓ Always on Top" : "Always on Top",
        type: "checkbox",
        checked: isAlwaysOnTop,
        click: () => {
          if (onToggleAlwaysOnTop) onToggleAlwaysOnTop(!isAlwaysOnTop);
          updateContextMenu();
        },
      },
      { type: "separator" },
      {
        label: "Open Focus",
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(`${targetUrl.replace('/overlay', '')}/focus`);
            mainWindow.show();
          }
        },
      },
      {
        label: "Open Dashboard",
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(`${targetUrl.replace('/overlay', '')}/dashboard`);
            mainWindow.show();
          }
        },
      },
      {
        label: "Open Settings",
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(`${targetUrl.replace('/overlay', '')}/settings`);
            mainWindow.show();
          }
        },
      },
      { type: "separator" },
      {
        label: "Quit Chronos",
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(contextMenu);
  };

  updateContextMenu();

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
    updateContextMenu();
  });

  return {
    tray,
    updateContextMenu,
  };
}

module.exports = { createSystemTray };
