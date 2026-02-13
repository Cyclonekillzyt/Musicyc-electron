import fs from "fs";
import path from "path";

export const downloads = (musicPath) => {
  if (!fs.existsSync(musicPath)) {
    console.error("Music path does not exist:", musicPath);
    return [];
  }

  const files = fs.readdirSync(musicPath);

  const filesFilted = files.filter(
    (file) =>
      file.endsWith(".webm") || file.endsWith(".opus") || file.endsWith(".mp3")
  );

  const musicObject = filesFilted.map((file) => ({
    id: file,
    title: path.parse(file).name,
    source: "local",
    path: path.join(musicPath, file),
    thumbnail: null,
  }));
  return musicObject;
};
