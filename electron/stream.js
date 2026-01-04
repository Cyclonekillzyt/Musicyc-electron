import { spawn } from "child_process";
import fs from "fs";




export function streamAudio(req, res, ytdlpPath) {

  if (!fs.existsSync(ytdlpPath)) {
    console.error("YTDLP binary not found at:", ytdlpPath);
  }
  
  const { videoId } = req.query;

  res.writeHead(200, {
    "Content-Type": "audio/mpeg",
    "Accept-Ranges": "bytes",
  });

  const ytdlp = spawn(ytdlpPath, [
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    "-",
    `https://www.youtube.com/watch?v=${videoId}`,
  ]);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (d) => console.error(d.toString()));
  ytdlp.on("close", () => res.end());
  req.on("close", () => {
    ytdlp.kill("SIGKILL");
  });
}
