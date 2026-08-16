const fs = require("fs");
const path = require("path");
const { screen } = require("electron");

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
        return {
          mode: state.mode === "widget" ? "widget" : "hud",
          alwaysOnTop: state.alwaysOnTop !== undefined ? state.alwaysOnTop : true,
          hud: this.validateBounds(state.hud, this.defaultHudBounds),
          widget: this.validateBounds(state.widget, this.defaultWidgetBounds),
        };
      }
    } catch {
      // ignore
    }
    return {
      mode: "hud",
      alwaysOnTop: true,
      hud: this.defaultHudBounds,
      widget: this.defaultWidgetBounds,
    };
  }

  saveState(state) {
    try {
      const data = JSON.stringify(state, null, 2);
      fs.writeFileSync(this.configPath, data, "utf8");
    } catch {
      // ignore
    }
  }

  validateBounds(bounds, defaultBounds) {
    if (!bounds || typeof bounds.x !== "number" || typeof bounds.y !== "number") {
      return defaultBounds;
    }
    try {
      const displays = screen.getAllDisplays();
      if (!displays || displays.length === 0) return bounds;
      const isVisible = displays.some((display) => {
        const { x, y, width, height } = display.bounds;
        return (
          bounds.x >= x - 50 &&
          bounds.x <= x + width - 50 &&
          bounds.y >= y - 50 &&
          bounds.y <= y + height - 50
        );
      });
      return isVisible ? bounds : defaultBounds;
    } catch {
      return bounds;
    }
  }
}

module.exports = WindowStateManager;
