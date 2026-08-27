import { spawnSync } from "child_process";

let cached = null;

export function hasFfmpeg() {
  if (cached !== null) return cached;
  try {
    const result = spawnSync("ffmpeg", ["-version"]);
    cached = result.status === 0;
  } catch {
    cached = false;
  }
  return cached;
}
