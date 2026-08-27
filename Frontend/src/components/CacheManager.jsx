import { useEffect, useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";

function formatBytes(bytes) {
  if (!bytes) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

// Streaming-cache size display + "clear cache" flow with a confirm modal.
// Shared by the compact Settings page and the dashboard's Settings and
// Downloads pages so the behavior stays identical everywhere it appears.
const CacheManager = () => {
  const { showToast } = usePlayer();
  const [cacheSize, setCacheSize] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const loadCacheSize = async () => {
    try {
      const bytes = await window.electronAPI.getCacheSize();
      setCacheSize(bytes);
    } catch (err) {
      console.error("Failed to read cache size:", err);
    }
  };

  useEffect(() => {
    loadCacheSize();
  }, []);

  const handleClear = async () => {
    setClearing(true);
    try {
      const { cleared } = await window.electronAPI.clearCache();
      showToast(`Cleared ${formatBytes(cleared)} of streaming cache`, "info");
      await loadCacheSize();
    } catch (err) {
      console.error(err);
      showToast("Couldn't clear the cache — try again.");
    } finally {
      setClearing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="hifi-row rounded-lg p-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium" style={{ color: "var(--cream)" }}>
            Streaming cache
          </p>
          <p className="hifi-eyebrow normal-case tracking-normal opacity-70 text-xs mt-1">
            {cacheSize === null ? "Calculating…" : `${formatBytes(cacheSize)} on disk`}
          </p>
        </div>
        <button
          type="button"
          className="hifi-btn-round"
          style={{ width: "auto", borderRadius: "0.6rem", padding: "0 0.9rem", gap: "0.4rem" }}
          onClick={() => setConfirmOpen(true)}
          disabled={!cacheSize}
        >
          <Trash2 size={15} />
          <span className="text-sm">Clear cache</span>
        </button>
      </div>

      <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-xs leading-relaxed">
        Streamed tracks are cached locally so they don't need to re-download
        every time you play them. Clearing the cache only removes this
        temporary copy — your downloaded library is never touched.
      </p>

      {confirmOpen && (
        <div
          className="hifi-modal-backdrop"
          onClick={() => !clearing && setConfirmOpen(false)}
        >
          <div className="hifi-modal" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} style={{ color: "var(--peak)" }} />
              <h2
                className="text-lg"
                style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
              >
                Clear streaming cache?
              </h2>
            </div>
            <p className="text-sm opacity-80 mb-5" style={{ color: "var(--cream)" }}>
              This deletes {cacheSize ? formatBytes(cacheSize) : "the"} of cached
              streamed audio from disk. Anything streaming right now keeps
              playing, but every other cached track will need to re-buffer
              next time you play it. Your downloaded library isn't affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="hifi-btn-round"
                style={{ width: "auto", borderRadius: "0.6rem", padding: "0 1rem" }}
                onClick={() => setConfirmOpen(false)}
                disabled={clearing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hifi-btn-round"
                style={{
                  width: "auto",
                  borderRadius: "0.6rem",
                  padding: "0 1rem",
                  borderColor: "var(--peak)",
                  color: "var(--peak)",
                }}
                onClick={handleClear}
                disabled={clearing}
              >
                {clearing ? "Clearing…" : "Clear cache"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CacheManager;
