import fs from "fs";
import path from "path";

export const downloads = (musicPath) => {
  if (!fs.existsSync(musicPath)) {
    console.error("Music path does not exist:", musicPath);
    return [];
  }

  const cachePath = path.join(musicPath, ".cache");

  const files = fs.readdirSync(musicPath);

  const audioFiles = files.filter(
    (file) =>
      file.endsWith(".webm") || file.endsWith(".opus") || file.endsWith(".mp3"),
  );

  return audioFiles.map((file) => {
    const filePath = path.join(musicPath, file);

    let metadata = {};

    if (fs.existsSync(cachePath)) {
      const metadataFiles = fs
        .readdirSync(cachePath)
        .filter((file) => file.endsWith(".json"));

      for (const metadataFile of metadataFiles) {
        try {
          const metadataPath = path.join(cachePath, metadataFile);
          const data = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

          if (data.fileName === file) {
            metadata = data;
            break;
          }
        } catch (error) {
          console.error(`Failed to read metadata file ${metadataFile}:`, error);
        }
      }
    }

    return {
      id: metadata.id || file,
      videoId: metadata.videoId || null,
      title: metadata.title || path.parse(file).name,
      channel: metadata.channel || "Unknown Artist",
      source: "local",
      path: filePath,
      thumbnails: metadata.thumbnails || null,
    };
  });
};
