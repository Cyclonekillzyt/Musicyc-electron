export const handleDownload = async (download) => {
  if (!download?.id) return;
  try {
    await window.electronAPI.downloadTrack(download);
    alert("Download completed! Check your Music/Musicyc folder");
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download audio. Try again.");
  } 
};



