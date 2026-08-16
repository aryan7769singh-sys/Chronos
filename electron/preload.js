const { contextBridge, ipcRenderer } = require("electron");

// Secure preload bridge isolating Node capabilities
contextBridge.exposeInMainWorld("chronosDesktop", {
  isDesktop: true,
  version: "0.15.1",
  onShortcutAction: (callback) => {
    if (typeof callback === "function") {
      ipcRenderer.on("chronos:shortcut-action", (_event, action) => {
        callback(action);
      });
    }
  },
  onDesktopModeChange: (callback) => {
    if (typeof callback === "function") {
      ipcRenderer.on("chronos:mode-changed", (_event, mode) => {
        callback(mode);
      });
    }
  },
  minimizeWindow: () => {
    ipcRenderer.send("chronos:minimize-window");
  },
  closeWindow: () => {
    ipcRenderer.send("chronos:close-window");
  },
  setDesktopMode: (mode) => {
    ipcRenderer.send("chronos:set-desktop-mode", mode);
  },
  toggleAlwaysOnTop: (enabled) => {
    ipcRenderer.send("chronos:set-always-on-top", enabled);
  },
  setOpacity: (opacity) => {
    ipcRenderer.send("chronos:set-opacity", opacity);
  },
  showNotification: (input) => {
    ipcRenderer.send("chronos:show-notification", input);
  },
  setContentSize: (width, height) => {
    ipcRenderer.send("chronos:set-content-size", { width, height });
  },
  openExternal: (routeOrUrl) => {
    ipcRenderer.send("chronos:open-external", routeOrUrl);
  },
});


