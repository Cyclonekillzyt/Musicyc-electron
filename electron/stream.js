import { spawn } from "child_process";
import fs from "fs";
import { tempDir } from "./main.js";
import path from "path";

const activeDownloads = new Map();

export async function streamAudio(req, res, ytdlpPath) {
  if (!fs.existsSync(ytdlpPath)) {
    console.error("YTDLP binary not found at:", ytdlpPath);
  }

  const { videoId } = req.query;

  if (!videoId) {
    res.writeHead(400);
    return res.end("Missing videoId");
  }

  const outputPath = path.join(tempDir, videoId);

  let existingFile = findDownloadedFile(videoId);

  if (!existingFile) {
    if (activeDownloads.has(videoId)) {
      await activeDownloads.get(videoId);
    } else {
      const downloadPromise = startDownload(videoId, outputPath, ytdlpPath);
      activeDownloads.set(videoId, downloadPromise);
      await downloadPromise;
    }

    existingFile = findDownloadedFile(videoId);
  }

  if (!existingFile) {
    res.writeHead(500);
    return res.end("Download failed");
  }

  serveFile(req, res, existingFile);
}

function findDownloadedFile(videoId) {
  const files = fs.readdirSync(tempDir);
  const match = files.find((f) => f.startsWith(videoId + "."));
  return match ? path.join(tempDir, match) : null;
}

function startDownload(videoId, outputPath, ytdlpPath) {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn(ytdlpPath, [
      "-f",
      "251/bestaudio/best",
      "--no-playlist",
      "-o",
      `${outputPath}.%(ext)s`,
      `https://www.youtube.com/watch?v=${videoId}`,
    ]);

    activeDownloads.set(videoId, ytdlp);

    ytdlp.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    ytdlp.stderr.on("data", (data) => {
      console.log(data.toString());
    });

    ytdlp.on("close", (code) => {
      activeDownloads.delete(videoId);
      if (code === 0) {
        console.log("Download finished:", videoId);
        resolve();
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });
  });
}

function serveFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath);
  const mime =
    ext === ".webm" ? "audio/webm" : ext === ".m4a" ? "audio/mp4" : "audio/ogg";

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const stream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": mime,
    });

    stream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": mime,
    });

    fs.createReadStream(filePath).pipe(res);
    console.log(filePath);
  }
}
