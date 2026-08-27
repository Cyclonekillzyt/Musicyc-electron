import { useEffect } from "react";
import { DownloadIcon, Check, X } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { handleDownload } from "./Download.jsx";

const Description = ({ info }) => {
  const { setDownload, downloadStatus, showToast } = usePlayer();

  const handleClick = () => {
    if (!info) return;
    setDownload(info);
    handleDownload(info, showToast);
  };

  const isThisTrack =
    info && downloadStatus && downloadStatus.videoId === info.id;
  const isDownloading =
    isThisTrack && !downloadStatus.done && !downloadStatus.error;
  const isDone = isThisTrack && downloadStatus.done;
  const isFailed = isThisTrack && downloadStatus.error;

  useEffect(() => {
    if (isFailed) {
      showToast(downloadStatus.error || "Download failed — try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFailed, downloadStatus?.error]);

  return (
    <div className="flex flex-col gap-1.5 px-2">
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2
            className="truncate text-2xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            {info ? info.title : "Nothing on the platter"}
          </h2>
          <p className="hifi-eyebrow truncate mt-1">
            {info ? info.channel : "Select a track to begin"}
          </p>
        </div>

        <button
          type="button"
          className="hifi-btn-round shrink-0"
          onClick={handleClick}
          aria-label="Download this track"
          title="Download this track"
          disabled={isDownloading}
        >
          {isDone ? (
            <Check size={18} style={{ color: "var(--teal-bright)" }} />
          ) : isFailed ? (
            <X size={18} style={{ color: "var(--peak)" }} />
          ) : (
            <DownloadIcon size={18} />
          )}
        </button>
      </div>

      {isDownloading && (
        <div className="hifi-download-bar">
          <div
            className="hifi-download-bar-fill"
            style={{ width: `${Math.round(downloadStatus.progress || 0)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Description;
