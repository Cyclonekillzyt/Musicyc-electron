import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadTrack = (url, outputDir, ytdlpPath) => {
  return new Promise((resolve, reject) => {

    const args = [
      "-x",
      "--audio-format",
      "best",
      "-o",
      path.join(outputDir, "%(title)s.%(ext)s"),
      url,
    ];

    const process = spawn(ytDlpPath, args);

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
