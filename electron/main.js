import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  globalShortcut,
  ipcMain,
} from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { downloadTrack } from "./download.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { searchYouTube } from "./search.js";
import { startServer } from "./server.js";
import { downloads } from "./logic/playlist.js";
import { clearCache, getCacheSize } from "./stream.js";
import { downloadQueue } from "./queue.js";
import os from "os";

app.disableHardwareAcceleration();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getYtDlpPath() {
  const platform = os.platform();

  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      "bin",
      platform === "win32"
        ? "yt-dlp.exe"
        : platform === "darwin"
          ? "yt-dlp_macos"
          : "yt-dlp_linux",
    );
  } else {
    return path.join(
      __dirname,
      "bin",
      platform === "win32"
        ? "yt-dlp.exe"
        : platform === "darwin"
          ? "yt-dlp_macos"
          : "yt-dlp_linux",
    );
  }
}

const ytDlpPath = getYtDlpPath();

const checkForUpdates = async () => {
  return new Promise((resolve, reject) => {
    const updateProc = spawn(ytDlpPath, ["-U"]);
    updateProc.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    updateProc.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    updateProc.on("error", reject);

    updateProc.on("close", (code) => {
      resolve(code);
    });
  });
};

let win;
let tray;
let frontend;
let server;
let lastKnownIsPlaying = false;

const envPath = path.join(__dirname, ".env");
dotenv.config({ path: envPath });

const baseDir = app.getPath("music");
const outputPath = path.join(baseDir, "Musicyc");

if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
export const tempDir = path.join(outputPath, ".cache");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 220,
    minHeight: 260,
    frame: false,
    backgroundColor: "#150e0b",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  const isProd = app.isPackaged;

  const buildPath = isProd
    ? path.join(process.resourcesPath, "frontend/dist/index.html")
    : path.join(__dirname, "../Frontend/dist/index.html");

  if (!isProd && !fs.existsSync(buildPath)) {
    frontend = spawn("npm", ["run", "dev"], {
      cwd: path.join(__dirname, "../Frontend"),
    });

    frontend.stdout.on("data", (data) => {
      process.stdout.write(`Frontend: ${data}`);
      const str = data.toString();
      if (str.includes("ready")) {
        win.loadURL("http://localhost:5173");
      }
    });
  } else {
    win.loadFile(buildPath);
  }
}

function createTray() {
  try {
    const iconPath = path.join(__dirname, "assets", "icon.png");
    const image = nativeImage
      .createFromPath(iconPath)
      .resize({ width: 16, height: 16 });
    tray = new Tray(image);
    tray.setToolTip("Musicyc");
    tray.on("click", () => {
      if (!win) return;
      win.isVisible() ? win.focus() : win.show();
    });
    updateTrayMenu(false);
  } catch (err) {
    console.error("Tray creation failed (icon missing?):", err);
  }
}

function updateTrayMenu(isPlaying) {
  if (!tray) return;
  lastKnownIsPlaying = isPlaying;
  const menu = Menu.buildFromTemplate([
    {
      label: "Show Musicyc",
      click: () => {
        win?.show();
        win?.focus();
      },
    },
    { type: "separator" },
    {
      label: isPlaying ? "Pause" : "Play",
      click: () => win?.webContents.send("media-key", "playpause"),
    },
    { label: "Next", click: () => win?.webContents.send("media-key", "next") },
    {
      label: "Previous",
      click: () => win?.webContents.send("media-key", "previous"),
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

function registerMediaKeys() {
  globalShortcut.register("MediaPlayPause", () =>
    win?.webContents.send("media-key", "playpause"),
  );
  globalShortcut.register("MediaNextTrack", () =>
    win?.webContents.send("media-key", "next"),
  );
  globalShortcut.register("MediaPreviousTrack", () =>
    win?.webContents.send("media-key", "previous"),
  );
}

app.whenReady().then(async () => {
  createWindow();
  createTray();
  registerMediaKeys();

  await checkForUpdates();
  server = startServer(ytDlpPath);
});

app.on("window-all-closed", () => {
  if (frontend) frontend.kill();
  if (server) server.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle("download-track", async (_, url) => {
  return await downloadTrack(url, outputPath, ytDlpPath);
});

ipcMain.handle("search-youtube", async (_, query) => {
  try {
    return await searchYouTube(query);
  } catch (err) {
    console.error(err);
    throw err;
  }
});

ipcMain.handle("current-download", async (_) => {
  return await downloads(outputPath);
});

ipcMain.handle("clear-cache", async () => {
  return clearCache();
});

ipcMain.handle("get-cache-size", async () => {
  return getCacheSize();
});

ipcMain.on("window-minimize", () => {
  if (win) win.minimize();
});

ipcMain.on("window-close", () => {
  if (win) win.close();
});

ipcMain.on("playback-state", (_e, isPlaying) => {
  updateTrayMenu(!!isPlaying);
});

downloadQueue.on("progress", ({ id, progress }) => {
  win?.webContents.send("download-progress", { videoId: id, progress });
});
downloadQueue.on("done", ({ id }) => {
  win?.webContents.send("download-progress", {
    videoId: id,
    progress: 100,
    done: true,
  });
});
downloadQueue.on("failed", ({ id, error }) => {
  win?.webContents.send("download-progress", {
    videoId: id,
    error: String(error?.message || error),
  });
});
