import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { ipcMain } from "electron";
import { downloadTrack } from "./download.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { searchYouTube } from "./search.js";
import { startServer } from "./server.js";
import os from "os";

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
        : "yt-dlp_linux"
    );
  } else {
    return path.join(
      __dirname,
      "bin",
      platform === "win32"
        ? "yt-dlp.exe"
        : platform === "darwin"
        ? "yt-dlp_macos"
        : "yt-dlp_linux"
    );
  }
}


const ytDlpPath = getYtDlpPath();

let win;
let frontend;
let server;

const envPath = path.join(__dirname, ".env");


dotenv.config({path: envPath});

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
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

app.whenReady().then(() => {
  createWindow();
  server = startServer(ytDlpPath);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (frontend) frontend.kill();
    app.quit();
  }
  if (server) server.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const baseDir = app.getPath("music");

const outputPath = path.join(baseDir, "Musicyc");
const cache = path.join(baseDir, ".cache");

if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
if (!fs.existsSync(cache)) fs.mkdirSync(cache, { recursive: true });

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
