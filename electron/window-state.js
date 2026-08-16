const fs = require("fs");
const path = require("path");
const { screen } = require("electron");
const { debugLog } = require("./logger");

class WindowStateManager {
  constructor(userDataPath) {
    this.configPath = path.join(userDataPath, "chronos-desktop-state.json");
    this.defaultHudBounds = {
      width: 420,
      height: 680,
      x: undefined,
      y: undefined,
    };
    this.defaultWidgetBounds = {
      width: 340,
      height: 420,
      x: undefined,
      y: undefined,
    };
  }

  loadState() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf8");
        const state = JSON.parse(raw);
        const loaded = {
          mode: state.mode === "widget" ? "widget" : "hud",
          alwaysOnTop: state.alwaysOnTop !== undefined ? !!state.alwaysOnTop : true,
          opacity: typeof state.opacity === "number" && Number.isFinite(state.opacity) ? Math.max(20, Math.min(100, state.opacity)) : 90,
          compact: typeof state.compact === "boolean" ? state.compact : false,
          launchOnStartup: typeof state.launchOnStartup === "boolean" ? state.launchOnStartup : false,
          launchMinimized: typeof state.launchMinimized === "boolean" ? state.launchMinimized : false,
          startupMode: state.startupMode === "hud" ? "hud" : "widget",
          hud: this.validateBounds(state.hud, this.defaultHudBounds),
          widget: this.validateBounds(state.widget, this.defaultWidgetBounds),
        };
        debugLog("[Chronos DEBUG] WindowStateManager.loadState() loaded existing state:", JSON.stringify(loaded));
        return loaded;
      }
    } catch (err) {
      debugLog("[Chronos DEBUG] Failed to load chronos-desktop-state.json, returning default state:", err);
    }
    const def = {
      mode: "widget",
      alwaysOnTop: true,
      opacity: 90,
      compact: false,
      launchOnStartup: false,
      launchMinimized: false,
      startupMode: "widget",
      hud: this.defaultHudBounds,
      widget: this.defaultWidgetBounds,
    };
    debugLog("[Chronos DEBUG] WindowStateManager.loadState() using default state:", JSON.stringify(def));
    return def;
  }

  saveState(state) {
    try {
      const data = JSON.stringify(state, null, 2);
      fs.writeFileSync(this.configPath, data, "utf8");
      debugLog("[Chronos DEBUG] WindowStateManager.saveState() successfully saved state to:", this.configPath);
    } catch (err) {
      debugLog("[Chronos DEBUG] Failed to save chronos-desktop-state.json:", err);
    }
  }

  validateBounds(bounds, defaultBounds) {
    if (
      !bounds ||
      typeof bounds.x !== "number" ||
      typeof bounds.y !== "number" ||
      !Number.isFinite(bounds.x) ||
      !Number.isFinite(bounds.y)
    ) {
      return { ...defaultBounds };
    }

    const width = typeof bounds.width === "number" && Number.isFinite(bounds.width) && bounds.width >= 240 && bounds.width <= 1400
      ? Math.round(bounds.width)
      : defaultBounds.width;

    const height = typeof bounds.height === "number" && Number.isFinite(bounds.height) && bounds.height >= 120 && bounds.height <= 1400
      ? Math.round(bounds.height)
      : defaultBounds.height;

    try {
      const displays = screen.getAllDisplays();
      if (!displays || displays.length === 0) {
        return { ...defaultBounds, width, height };
      }

      // Ensure window coordinates land inside display workArea
      const isVisibleOnAnyDisplay = displays.some((display) => {
        const workArea = display.workArea || display.bounds;
        return (
          bounds.x >= workArea.x - 50 &&
          bounds.x <= workArea.x + workArea.width - 50 &&
          bounds.y >= workArea.y - 50 &&
          bounds.y <= workArea.y + workArea.height - 50
        );
      });

      if (isVisibleOnAnyDisplay) {
        return {
          x: Math.round(bounds.x),
          y: Math.round(bounds.y),
          width,
          height,
        };
      }
    } catch {
      // ignore
    }

    return { ...defaultBounds };
  }
}

module.exports = WindowStateManager;
