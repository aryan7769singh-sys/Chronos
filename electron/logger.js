const fs = require("fs");
const path = require("path");

function getLogPath() {
  const dir = process.env.APPDATA || "C:\\Users\\aryan\\AppData\\Roaming";
  return path.join(dir, "chronos-debug.log");
}

function debugLog(...args) {
  const formatted = args
    .map((a) => (typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)))
    .join(" ");
  const line = `${new Date().toISOString()} ${formatted}\n`;
  try {
    fs.appendFileSync(getLogPath(), line, "utf8");
  } catch (err) {
    console.error("debugLog write error:", err);
  }
  console.log(...args);
}

module.exports = { debugLog, getLogPath };
