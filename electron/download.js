import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { tempDir } from "./main.js";
import { downloadQueue } from "./queue.js";
import { hasFfmpeg } from "./ffmpegCheck.js";

const sanitizeFileName = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();

function parsePercent(line) {
  const match = line.match(/(\d{1,3}(?:\.\d)?)%/);
  return match ? parseFloat(match[1]) : null;
}

function runDownload(url, outputDir, ytdlpPath) {
  const videoId = url?.id;

  return new Promise((resolve, reject) => {
    const files = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
    const checkFilePath = files
      .map((f) => path.join(tempDir, f))
      .find((f) => path.basename(f).startsWith(videoId + "."));

    if (checkFilePath && fs.existsSync(checkFilePath)) {
      const ext = path.extname(checkFilePath) || ".webm";
      const safeTitle = sanitizeFileName(url.title || videoId);
      const finalFileName = `${safeTitle}${ext}`;
      const outputFilePath = path.join(outputDir, finalFileName);
      fs.copyFileSync(checkFilePath, outputFilePath);
      saveMetadata(url, finalFileName);
      downloadQueue.updateProgress(videoId, 100);
      return resolve("Download completed!");
    }

    if (!hasFfmpeg()) {
      return reject(
        new Error(
          "ffmpeg not found on PATH — it's required to extract/embed audio.",
        ),
      );
    }

    const args = [
      "-x",
      "--audio-format",
      "best",
      "--embed-metadata",
      "--embed-thumbnail",
      "--newline",
      "--print",
      "after_move:filepath",
      "-o",
      path.join(outputDir, "%(title)s.%(ext)s"),
      `https://www.youtube.com/watch?v=${videoId}`,
    ];

    const proc = spawn(ytdlpPath, args);
    let finalFilePath = null;

    proc.stdout.on("data", (data) => {
      const text = data.toString();
      console.log(text);
      text.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const percent = parsePercent(trimmed);
        if (percent !== null) {
          downloadQueue.updateProgress(videoId, percent);
          return;
        }

        if (path.isAbsolute(trimmed) && fs.existsSync(trimmed)) {
          finalFilePath = trimmed;
        }
      });
    });

    let stderrTail = "";
    proc.stderr.on("data", (data) => {
      const text = data.toString();
      console.error(text);
      stderrTail = (stderrTail + text).slice(-4000);
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            stderrTail.trim()
              ? `Download failed with code ${code}: ${stderrTail.trim()}`
              : `Download failed with code ${code}`,
          ),
        );
      }

      if (!finalFilePath) {
        return reject(
          new Error(
            "yt-dlp reported success but no output file path was captured.",
          ),
        );
      }

      saveMetadata(url, path.basename(finalFilePath));
      downloadQueue.updateProgress(videoId, 100);
      resolve("Download completed!");
    });
  });
}

export const downloadTrack = (url, outputDir, ytdlpPath) => {
  const videoId = url?.id;
  return downloadQueue.add(videoId, () =>
    runDownload(url, outputDir, ytdlpPath),
  );
};

function saveMetadata(track, fileName) {
  const videoId = track?.id;

  if (!videoId) return;

  const metadataPath = path.join(tempDir, `${videoId}.json`);

  const metadata = {
    id: videoId,
    videoId,
    source: "local",
    title: track.title || videoId,
    channel: track.channel || "Unknown Artist",
    thumbnails: track.thumbnails || null,
    fileName,
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}
