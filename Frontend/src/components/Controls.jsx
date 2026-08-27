import {
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Pause,
} from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { useEffect } from "react";

const Controls = () => {
  const {
    audioRef,
    isPlaying,
    isBuffering,
    togglePlayPause,
    progress,
    audioSize,
    setAudioSize,
    playedTime,
    setProgress,
    setSeeking,
    playNext,
    playPrev,
    shuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeat,
  } = usePlayer();

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
  };

  const handleSeekingStart = () => {
    setSeeking(true);
  };

  const handleSeekEnd = (e) => {
    const audio = audioRef.current;
    const newProgress = parseFloat(e.target.value);
    audio.currentTime = (newProgress / 100) * audio.duration;
    setSeeking(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const updateAudioSize = () => {
      setAudioSize(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.addEventListener("loadedmetadata", updateAudioSize);
    audio.addEventListener("durationchange", updateAudioSize);
    return () => {
      audio.removeEventListener("loadedmetadata", updateAudioSize);
      audio.removeEventListener("durationchange", updateAudioSize);
    };
  }, [audioRef, setAudioSize]);

  const totalLabel = audioSize
    ? `${Math.floor(audioSize / 60)}:${Math.floor(audioSize % 60)
        .toString()
        .padStart(2, "0")}`
    : "--:--";

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <div className="flex flex-col gap-3 px-2 pb-1">
      <div className="w-full flex justify-center items-center gap-3">
        <span className="hifi-time text-right">{playedTime || "0:00"}</span>

        <div className="hifi-range-wrap flex-1">
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            className={`hifi-range ${isBuffering ? "is-buffering" : ""}`}
            style={{ "--val": `${progress}%` }}
            onMouseDown={handleSeekingStart}
            onTouchStart={handleSeekingStart}
            onChange={(e) => handleProgressChange(e)}
            onMouseUp={(e) => handleSeekEnd(e)}
            onTouchEnd={(e) => handleSeekEnd(e)}
            disabled={isBuffering}
          />
        </div>

        <span className="hifi-time">
          {isBuffering ? "Buffering…" : totalLabel}
        </span>
      </div>

      <div className="relative flex items-center justify-center">
        <button
          type="button"
          className={`hifi-toggle hifi-hide-mini absolute left-0 ${
            repeatMode !== "off" ? "is-active" : ""
          }`}
          title={
            repeatMode === "off"
              ? "Repeat: off"
              : repeatMode === "all"
                ? "Repeat: all"
                : "Repeat: one"
          }
          onClick={cycleRepeat}
        >
          <RepeatIcon size={16} />
          <span className="hifi-toggle-led" />
        </button>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hifi-btn-round"
            title="Previous track"
            aria-label="Previous track"
            onClick={playPrev}
          >
            <SkipBack size={16} />
          </button>

          <button
            type="button"
            className="hifi-btn-play"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
            disabled={isBuffering}
          >
            {isBuffering ? (
              <span className="hifi-spinner" aria-hidden="true" />
            ) : isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} className="ml-0.5" />
            )}
          </button>

          <button
            type="button"
            className="hifi-btn-round"
            title="Next track"
            aria-label="Next track"
            onClick={playNext}
          >
            <SkipForward size={16} />
          </button>
        </div>

        <button
          type="button"
          className={`hifi-toggle hifi-hide-mini absolute right-0 ${
            shuffle ? "is-active" : ""
          }`}
          title={shuffle ? "Shuffle: on" : "Shuffle: off"}
          onClick={toggleShuffle}
        >
          <Shuffle size={16} />
          <span className="hifi-toggle-led" />
        </button>
      </div>

      <div
        className={`hifi-vu justify-center hifi-hide-mini ${isPlaying ? "is-playing" : ""}`}
      >
        <div className="hifi-vu-bar" />
        <div className="hifi-vu-bar" />
        <div className="hifi-vu-bar" />
        <div className="hifi-vu-bar" />
        <div className="hifi-vu-bar" />
      </div>
    </div>
  );
};

export default Controls;
