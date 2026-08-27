import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { tempDir } from "./main.js";
import { streamQueue } from "./queue.js";
import { hasFfmpeg } from "./ffmpegCheck.js";

const activeDownloads = new Map();
const AUDIO_EXTENSIONS = new Set([".webm", ".m4a", ".opus", ".mp3", ".ogg"]);

function findDownloadedFile(videoId) {
  console.log(`[stream] checking cache for videoId=${videoId}`);
  if (!fs.existsSync(tempDir)) return null;
  const files = fs.readdirSync(tempDir);
  const match = files.find((f) => {
    if (!f.startsWith(videoId + ".")) return false;
    if (f.endsWith(".part")) return false;
    if (!AUDIO_EXTENSIONS.has(path.extname(f))) return false;
    return true;
  });
  if (!match) return null;

  const fullPath = path.join(tempDir, match);
  try {
    if (fs.statSync(fullPath).size === 0) return null;
  } catch {
    return null;
  }
  console.log(`[stream] cache hit for videoId=${videoId}: ${fullPath}`);
  return fullPath;
}

export async function streamAudio(req, res, ytdlpPath) {
  const { videoId } = req.query;
  console.log(`[stream] request for videoId=${videoId}`);

  if (!videoId) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    return res.end("Missing videoId");
  }

  const active = activeDownloads.get(videoId);
  if (active) {
    console.log(`[stream] ${videoId}: attaching to in-progress download`);
    return attachToLiveDownload(active, req, res);
  }

  const existing = findDownloadedFile(videoId);
  if (existing) {
    console.log(`[stream] ${videoId}: serving cached file ${existing}`);
    return serveFile(req, res, existing);
  }

  console.log(`[stream] ${videoId}: no cache hit — starting live download`);

  const entry = {
    filePath: path.join(tempDir, `${videoId}.webm`),
    chunks: [],
    bytesWritten: 0,
    complete: false,
    error: null,
    subscribers: new Set(),
  };
  activeDownloads.set(videoId, entry);
  attachToLiveDownload(entry, req, res);

  streamQueue
    .add(videoId, () => runLiveDownload(entry, ytdlpPath, videoId))
    .catch((err) => {
      console.error(`[stream] ${videoId}: live download failed:`, err);
    });
}

function runLiveDownload(entry, ytdlpPath, videoId) {
  return new Promise((resolve, reject) => {
    if (!hasFfmpeg()) {
      return reject(
        new Error("ffmpeg not found on PATH — required to stream audio."),
      );
    }

    const partialPath = entry.filePath + ".part";
    const writeStream = fs.createWriteStream(partialPath);

    const ytProc = spawn(ytdlpPath, [
      "-f",
      "bestaudio/best",
      "--no-playlist",
      "-o",
      "-",
      `https://www.youtube.com/watch?v=${videoId}`,
    ]);

    const ffmpegProc = spawn("ffmpeg", [
      "-analyzeduration",
      "0",
      "-probesize",
      "32k",
      "-i",
      "pipe:0",
      "-vn",
      "-c:a",
      "libopus",
      "-b:a",
      "128k",
      "-f",
      "webm",
      "pipe:1",
    ]);

    ytProc.stdout.pipe(ffmpegProc.stdin);

    let ytStderrTail = "";
    ytProc.stderr.on("data", (d) => {
      ytStderrTail = (ytStderrTail + d.toString()).slice(-4000);
    });

    let ffmpegStderrTail = "";
    ffmpegProc.stderr.on("data", (d) => {
      ffmpegStderrTail = (ffmpegStderrTail + d.toString()).slice(-4000);
    });

    ffmpegProc.stdout.on("data", (chunk) => {
      writeStream.write(chunk);
      const isFirstChunk = entry.bytesWritten === 0;
      entry.chunks.push(chunk);
      entry.bytesWritten += chunk.length;

      for (const res of entry.subscribers) {
        if (res.writableEnded) continue;
        if (isFirstChunk && !res.headersSent) {
          res.writeHead(200, {
            "Content-Type": "audio/webm",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-store",
            "Accept-Ranges": "none",
          });
        }
        res.write(chunk);
      }
    });

    let settled = false;
    const fail = (err) => {
      if (settled) return;
      settled = true;
      entry.error = err;
      for (const res of entry.subscribers) {
        if (res.writableEnded) continue;
        if (res.headersSent) res.end();
        else sendStreamError(res);
      }
      entry.subscribers.clear();
      activeDownloads.delete(videoId);
      fs.unlink(partialPath, () => {});
      try {
        ytProc.kill();
      } catch {}
      try {
        ffmpegProc.kill();
      } catch {}
      reject(err);
    };

    ytProc.on("error", (err) => fail(err));
    ffmpegProc.on("error", (err) => fail(err));

    ytProc.on("close", (code) => {
      if (code !== 0 && !settled) {
        fail(
          new Error(
            ytStderrTail.trim()
              ? `yt-dlp exited with code ${code}: ${ytStderrTail.trim()}`
              : `yt-dlp exited with code ${code}`,
          ),
        );
      }
    });

    ffmpegProc.on("close", (code) => {
      writeStream.end(() => {
        if (settled) return;
        if (code !== 0) {
          return fail(
            new Error(
              ffmpegStderrTail.trim()
                ? `ffmpeg exited with code ${code}: ${ffmpegStderrTail.trim()}`
                : `ffmpeg exited with code ${code}`,
            ),
          );
        }
        if (entry.bytesWritten === 0) {
          return fail(new Error("No audio data was produced."));
        }
        settled = true;
        try {
          fs.renameSync(partialPath, entry.filePath);
        } catch (err) {
          return fail(err);
        }
        entry.complete = true;
        entry.chunks = [];
        for (const res of entry.subscribers) {
          if (!res.writableEnded) res.end();
        }
        entry.subscribers.clear();
        activeDownloads.delete(videoId);
        resolve();
      });
    });
  });
}

function attachToLiveDownload(entry, req, res) {
  if (entry.error) {
    return sendStreamError(res);
  }

  if (req.headers.range) {
    console.log(
      `[stream] range request ignored for in-progress live stream (${req.url})`,
    );
  }

  entry.subscribers.add(res);
  req.on("close", () => entry.subscribers.delete(res));

  if (entry.bytesWritten > 0) {
    res.writeHead(200, {
      "Content-Type": "audio/webm",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-store",
      "Accept-Ranges": "none",
    });
    for (const chunk of entry.chunks) {
      if (res.writableEnded) return;
      res.write(chunk);
    }
    if (entry.complete) res.end();
  }
}

function sendStreamError(res) {
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(502, { "Content-Type": "text/plain" });
  res.end(
    "Couldn't stream this track — check your internet connection and try again.",
  );
}

function serveFile(req, res, filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Cached file not found");
  }

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
  }
}

export function getCacheSize() {
  if (!fs.existsSync(tempDir)) return 0;
  return fs.readdirSync(tempDir).reduce((total, f) => {
    if (f.endsWith(".part")) return total;
    try {
      return total + fs.statSync(path.join(tempDir, f)).size;
    } catch {
      return total;
    }
  }, 0);
}

export function clearCache() {
  if (!fs.existsSync(tempDir)) return { cleared: 0 };
  let cleared = 0;
  for (const f of fs.readdirSync(tempDir)) {
    if (f.endsWith(".part")) continue;
    const filePath = path.join(tempDir, f);
    try {
      cleared += fs.statSync(filePath).size;
      fs.unlinkSync(filePath);
    } catch {}
  }
  return { cleared };
}
