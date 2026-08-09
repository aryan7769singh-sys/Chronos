const { contextBridge, ipcRenderer } = require("electron");

// Secure preload bridge isolating Node capabilities
contextBridge.exposeInMainWorld("chronosDesktop", {
  isDesktop: true,
  version: "0.15.0",
  onShortcutAction: (callback) => {
    if (typeof callback === "function") {
      ipcRenderer.on("chronos:shortcut-action", (_event, action) => {
        callback(action);
      });
    }
  },
  toggleAlwaysOnTop: (enabled) => {
    ipcRenderer.send("chronos:set-always-on-top", enabled);
  },
  setOpacity: (opacity) => {
    ipcRenderer.send("chronos:set-opacity", opacity);
  },
});
