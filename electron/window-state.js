const fs = require("fs");
const path = require("path");
const { screen } = require("electron");

class WindowStateManager {
  constructor(userDataPath) {
    this.configPath = path.join(userDataPath, "overlay-window-state.json");
    this.defaultBounds = {
      width: 420,
      height: 680,
      x: undefined,
      y: undefined,
    };
  }

  loadState() {
    try {
      if (fs.existsSync(this.configPath)) {
        const raw = fs.readFileSync(this.configPath, "utf8");
        const state = JSON.parse(raw);
        if (this.isValidState(state)) {
          return state;
        }
      }
    } catch {
      // ignore
    }
    return this.defaultBounds;
  }

  saveState(bounds) {
    try {
      const data = JSON.stringify({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      });
      fs.writeFileSync(this.configPath, data, "utf8");
    } catch {
      // ignore
    }
  }

  isValidState(state) {
    if (!state || typeof state.x !== "number" || typeof state.y !== "number") {
      return false;
    }
    const displays = screen.getAllDisplays();
    return displays.some((display) => {
      const { x, y, width, height } = display.bounds;
      return (
        state.x >= x - 50 &&
        state.x <= x + width - 50 &&
        state.y >= y - 50 &&
        state.y <= y + height - 50
      );
    });
  }
}

module.exports = WindowStateManager;
