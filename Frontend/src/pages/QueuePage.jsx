import { useState } from "react";
import { GripVertical, X, Disc3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import sas from "../assets/sasa.png";

const QueuePage = () => {
  const navigate = useNavigate();
  const { queue, playIndex, playQueueIndex, removeFromQueueAt, reorderQueue } =
    usePlayer();
  const [dragIndex, setDragIndex] = useState(null);

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    reorderQueue(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="hifi-panel h-full min-h-0 w-[92%] max-w-2xl flex flex-col my-5 p-8 gap-6">
      <span className="hifi-screw hifi-screw-tl" />
      <span className="hifi-screw hifi-screw-tr" />
      <span className="hifi-screw hifi-screw-bl" />
      <span className="hifi-screw hifi-screw-br" />

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="hifi-btn-round"
          onClick={() => navigate("/")}
          aria-label="Back to player"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <p className="hifi-eyebrow">Up next</p>
          <h1
            className="text-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            Play Queue
          </h1>
        </div>
      </div>

      <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {queue.length === 0 ? (
          <p className="text-center mt-10 hifi-eyebrow normal-case tracking-normal opacity-60">
            Queue is empty — play something from search or your collection
          </p>
        ) : (
          queue.map((track, index) => {
            const image = track.thumbnails ? track.thumbnails.default.url : sas;
            const isCurrent = index === playIndex;

            return (
              <div
                key={`${track.id || track.videoId}-${index}`}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                className={`hifi-row p-2.5 rounded-lg flex items-center gap-2 px-3 ${
                  isCurrent ? "hifi-row-current" : ""
                }`}
              >
                <GripVertical
                  size={14}
                  className="shrink-0 cursor-grab"
                  style={{ color: "var(--brass-dark)" }}
                />

                <div
                  className="relative shrink-0 rounded-full overflow-hidden size-8 flex items-center justify-center cursor-pointer"
                  style={{ border: "1.5px solid var(--brass-dark)", background: "#150e0b" }}
                  onClick={() => playQueueIndex(index)}
                >
                  {track.thumbnails ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Disc3 size={14} style={{ color: "var(--brass)" }} />
                  )}
                </div>

                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => playQueueIndex(index)}
                >
                  <p className="truncate text-sm font-medium" style={{ color: "var(--cream)" }}>
                    {track.title || "Unknown Title"}
                  </p>
                  <p className="hifi-eyebrow truncate normal-case tracking-normal opacity-70 text-xs">
                    {track.channel || "Unknown Artist"}
                  </p>
                </div>

                <button
                  type="button"
                  className="hifi-btn-round shrink-0"
                  style={{ width: "1.9rem", height: "1.9rem" }}
                  onClick={() => removeFromQueueAt(index)}
                  aria-label="Remove from queue"
                  title="Remove from queue"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QueuePage;
