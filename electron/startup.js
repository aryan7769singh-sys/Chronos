const { app } = require("electron");
const { execFileSync } = require("child_process");
const { debugLog } = require("./logger");

function configureWindowsStartup({ launchOnStartup, launchMinimized, startupMode }) {
  const isPackaged = app.isPackaged;
  const execPath = process.execPath;

  debugLog(`[Chronos Startup] app.isPackaged = ${isPackaged}`);
  debugLog(`[Chronos Startup] process.execPath = ${execPath}`);
  debugLog(`[Chronos Startup] launchOnStartup = ${launchOnStartup}`);
  debugLog(`[Chronos Startup] launchMinimized = ${launchMinimized}`);
  debugLog(`[Chronos Startup] startupMode = ${startupMode}`);

  if (process.platform !== "win32") {
    if (isPackaged) {
      try {
        app.setLoginItemSettings({
          openAtLogin: !!launchOnStartup,
          openAsHidden: !!launchMinimized,
        });
      } catch (err) {
        debugLog("[Chronos Startup] macOS/Linux setLoginItemSettings error:", err);
      }
    }
    return;
  }

  // Development Safety: Do not register dev electron.exe / node as permanent Windows startup items
  if (!isPackaged) {
    debugLog(
      `[Chronos Startup] Development mode detected (app.isPackaged = false). Skipping Windows Registry modification for dev executable: ${execPath}`
    );
    return;
  }

  const regKey = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";
  const valueName = "ChronosHUD";

  if (launchOnStartup) {
    const startupCommand = `"${execPath}"${launchMinimized ? " --hidden" : ""}`;
    debugLog(`[Chronos Startup] startupCommand = ${startupCommand}`);

    let writeResult = "FAILED";
    try {
      execFileSync("reg.exe", [
        "add",
        regKey,
        "/v",
        valueName,
        "/t",
        "REG_SZ",
        "/d",
        startupCommand,
        "/f",
      ]);
      writeResult = "SUCCESS";
    } catch (err) {
      writeResult = `FAILED (${err.message})`;
    }
    debugLog(`[Chronos Startup] registry registration result = ${writeResult}`);

    // Read back from registry immediately using fast reg.exe query
    let registryValue = "";
    try {
      const out = execFileSync(
        "reg.exe",
        ["query", regKey, "/v", valueName],
        { encoding: "utf8" }
      );
      const match = out.match(/ChronosHUD\s+REG_SZ\s+(.+)/i);
      registryValue = match ? match[1].trim() : out.trim();
    } catch (err) {
      debugLog(`[Chronos Startup] Registry readback error: ${err.message}`);
    }

    debugLog(`[Chronos Startup] registry value after registration = ${JSON.stringify(registryValue)}`);

    if (registryValue && registryValue.length > 0) {
      debugLog(`[Chronos Startup] VERIFIED: ChronosHUD registry value contains a non-empty executable command.`);
    } else {
      debugLog(`[Chronos Startup] WARNING: ChronosHUD registry value readback returned empty data!`);
    }
  } else {
    let removeResult = "SUCCESS";
    try {
      execFileSync("reg.exe", ["delete", regKey, "/v", valueName, "/f"]);
    } catch (err) {
      removeResult = `NOT PRESENT OR REMOVED (${err.message})`;
    }
    debugLog(`[Chronos Startup] registry removal result = ${removeResult}`);
  }
}

function checkWasOpenedAtLogin() {
  if (process.platform !== "win32") return { wasOpenedAtLogin: false, wasOpenedAsHidden: false };
  const args = process.argv || [];
  const hasHiddenArg = args.includes("--hidden") || args.includes("--autostart");

  let wasOpenedAtLogin = false;
  let wasOpenedAsHidden = false;
  try {
    const settings = app.getLoginItemSettings();
    wasOpenedAtLogin = !!settings.wasOpenedAtLogin;
    wasOpenedAsHidden = !!settings.wasOpenedAsHidden;
  } catch {
    // ignore
  }

  return {
    wasOpenedAtLogin: hasHiddenArg || wasOpenedAtLogin,
    wasOpenedAsHidden: hasHiddenArg || wasOpenedAsHidden,
  };
}

module.exports = {
  configureWindowsStartup,
  checkWasOpenedAtLogin,
};
