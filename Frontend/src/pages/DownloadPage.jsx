import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

const DownloadPage = () => {
  const { download } = usePlayer();
  const [isDownloading, setIsDownloading] = useState(false);

  console.log(download);
  const handleDownload = async () => {
    if (!download?.url) return;

    setIsDownloading(true);

    try {
      setIsDownloading(true);
      console.log(download.url)
      await window.electronAPI.downloadTrack(download.url);
      alert("Download completed! Check your Music/Musicyc folder");
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download audio. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-2xl font-bold">{download?.title}</h2>
      <img
        src={download?.thumbnails.default.url}
        alt={download?.title}
        className="w-64 h-36 object-cover rounded-lg"
      />

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isDownloading ? "Downloading..." : "Download MP3"}
      </button>

      {isDownloading && (
        <p className="text-gray-500 mt-2">Your download is in progress...</p>
      )}
    </div>
  );
};

export default DownloadPage;
