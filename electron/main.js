import { app, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { ipcMain } from "electron";
import { downloadTrack } from "./download.js";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
import { searchYouTube } from "./search.js";
import { startServer } from "./server.js";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getYtDlpPath() {
  const platform = os.platform();

  if (platform === "win32") return path.join(__dirname, "bin", "yt-dlp.exe");
  if (platform === "darwin") return path.join(__dirname, "bin", "yt-dlp_macos");
  return path.join(__dirname, "bin", "yt-dlp_linux");
}

const ytDlpPath = getYtDlpPath();

let win;
let frontend;
let server;

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
}

const buildPath = path.join(__dirname, "../Frontend/dist/index.html");
if (fs.existsSync(buildPath)) {
  win.loadFile(buildPath);
} else {
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
  return await downloadTrack(url, outputPath);
});

ipcMain.handle("search-youtube", async (_, query) => {
  try {
    return await searchYouTube(query);
  } catch (err) {
    console.error(err);
    throw err;
  }
});
