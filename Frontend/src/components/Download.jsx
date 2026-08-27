export const handleDownload = async (download, showToast) => {
  if (!download?.id) return;
  try {
    await window.electronAPI.downloadTrack(download);
  } catch (err) {
    console.error("Download failed:", err);
    if (showToast) {
      showToast(
        "Couldn't start the download — check your connection and try again.",
      );
    }
  }
};
