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
  const outputPath = path.join(tempDir, `${videoId}.opus`);

  if (!videoId) {
    res.writeHead(400);
    return res.end("Missing videoId");
  }

  if (!fs.existsSync(outputPath) && !activeDownloads.has(videoId)) {
    startDownload(videoId, outputPath, ytdlpPath);
  }

  await waitForFile(outputPath);

  serveFile(req, res, outputPath);
}

function startDownload(videoId, outputPath, ytdlpPath) {
  const ytdlp = spawn(ytdlpPath, [
    "-x",
    "--audio-format",
    "best",
    "-o",
    outputPath,
    `https://www.youtube.com/watch?v=${videoId}`,
  ]);

  activeDownloads.set(videoId, ytdlp);

  ytdlp.on("close", () => {
    activeDownloads.delete(videoId);
    console.log("Download finished:", videoId);
  });
}

function waitForFile(filePath) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (fs.existsSync(filePath)) {
        const { size } = fs.statSync(filePath);
        if (size > 100000) {
          clearInterval(interval);
          resolve();
        }
      }
    }, 100);
  });
}

function serveFile(req, res, filePath) {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

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
      "Content-Type": "audio/ogg",
    });

    stream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath).pipe(res);
  }
}
