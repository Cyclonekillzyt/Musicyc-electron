import { spawn } from "child_process";
import path from "path";
import { tempDir } from "./main.js";
import fs from "fs";

const sanitizeFileName = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();

export const downloadTrack = (url, outputDir, ytdlpPath) => {
  const videoId = url?.id;
  const files = fs.readdirSync(tempDir);
  const checkFilePath = files
    .map((f) => path.join(tempDir, f))
    .find((f) => path.basename(f).startsWith(videoId + "."));

  if (fs.existsSync(checkFilePath)) {
    const safeTitle = sanitizeFileName(url.title || videoId);
    const finalFileName = `${safeTitle}.mp3`;
    const outputFilePath = path.join(outputDir, finalFileName);
    return fs.copyFileSync(checkFilePath, outputFilePath);
  }
  return new Promise((resolve, reject) => {
    const args = [
      "-x",
      "--audio-format",
      "best",
      "-o",
      path.join(outputDir, "%(title)s.%(ext)s"),
      `https://www.youtube.com/watch?v=${videoId}`,
    ];

    const process = spawn(ytdlpPath, args);

    process.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    process.stderr.on("data", (data) => {
      console.error(data.toString());
    });

    process.on("close", (code) => {
      if (code === 0) resolve("Download completed!");
      else reject(`Download failed wih code ${code}`);
    });
  });
};
