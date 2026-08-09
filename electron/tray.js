const { Tray, Menu, nativeImage, app } = require("electron");

let tray = null;

function createSystemTray(mainWindow, targetUrl) {
  // Create simple 16x16 icon data fallback
  const icon = nativeImage.createEmpty();

  tray = new Tray(icon);
  tray.setToolTip("Chronos Command HUD");

  const updateContextMenu = () => {
    const isVisible = mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible();
    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? "Hide Command HUD" : "Show Command HUD",
        click: () => {
          if (isVisible) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
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
        label: "Quit Chronos HUD",
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

  return tray;
}

module.exports = { createSystemTray };
