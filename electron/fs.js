import fs from "fs";
import path from "path";

export function getCacheFile(cacheDir, videoId) {
  return path.join(cacheDir, `${videoId}.webm`);
}

export function isCached(cacheDir, videoId) {
  return fs.existsSync(getCacheFile(cacheDir, videoId));
}
