import {
  Play,
  Repeat,
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
    setIsPlaying,
    progress,
    audioSize,
    setAudioSize,
    playedTime,
    setProgress,
    seeking,
    setSeeking,
  } = usePlayer();

  const handleProgressChange = (e) => {
    const audio = audioRef.current;
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
      setAudioSize(audio.duration);
    };
    audio.addEventListener("loadedmetadata", updateAudioSize);
    return () => audio.removeEventListener("loadedmetadata", updateAudioSize);
  }, [audioRef, setAudioSize]);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };
  return (
    <div className="flex flex-col gap-4 card mb-2 ">
      <div className="w-full flex justify-center items-center px-4 gap-5">
        <p>{playedTime || "0:00"}</p>
        <input
          type="range"
          min={0}
          className="range w-[85%] range-primary"
          value={progress}
          max={100}
          onMouseDown={handleSeekingStart}
          onTouchStart={handleSeekingStart}
          onChange={(e) => handleProgressChange(e)}
          onMouseUp={(e) => handleSeekEnd(e)}
          onTouchEnd={(e) => handleSeekEnd(e)}
        />

        <p>
          {audioSize
            ? `${Math.floor(audioSize / 60)}:${Math.floor(audioSize % 60)
                .toString()
                .padStart(2, "0")}`
            : "0:00"}
        </p>
      </div>
      <div className="flex items-center justify-between  px-4 py-1 ">
        <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1">
          <Repeat />
        </div>
        <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1 ">
          <SkipBack />
        </div>
        {isPlaying ? (
          <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1 ">
            <Pause onClick={togglePlay} />
          </div>
        ) : (
          <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1 ">
            <Play onClick={togglePlay} />
          </div>
        )}
        <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1 ">
          <SkipForward />
        </div>
        <div className="cursor-pointer hover:scale-120 hover:glass rounded-full p-1 ">
          <Shuffle />
        </div>
      </div>
    </div>
  );
};

export default Controls;
