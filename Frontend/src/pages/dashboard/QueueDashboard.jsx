import { useState } from "react";
import { GripVertical, X, Disc3 } from "lucide-react";
import { usePlayer } from "../../context/PlayerContext";
import sas from "../../assets/sasa.png";

const QueueDashboard = () => {
  const { queue, playIndex, playQueueIndex, removeFromQueueAt, reorderQueue } =
    usePlayer();
  const [dragIndex, setDragIndex] = useState(null);

  const handleDrop = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    reorderQueue(dragIndex, targetIndex);
    setDragIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="hifi-eyebrow">Up next</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Play Queue
        </h1>
      </div>

      <div className="flex flex-col gap-1.5">
        {queue.length === 0 ? (
          <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm mt-6">
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

export default QueueDashboard;
