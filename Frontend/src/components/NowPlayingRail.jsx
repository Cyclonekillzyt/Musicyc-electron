import Thumb from "./Thumb";
import Description from "./Description";
import Controls from "./Controls";
import { usePlayer } from "../context/PlayerContext";

const NowPlayingRail = () => {
  const { currentTrack, queue, playIndex, playQueueIndex } = usePlayer();
  const thumb = currentTrack?.thumbnails?.high?.url ?? null;
  const upNext = queue.slice(playIndex + 1, playIndex + 4);

  return (
    <aside className="hifi-now-playing-rail">
      <p className="hifi-eyebrow text-center mb-3">Now Playing</p>

      <div className="hifi-rail-turntable">
        <Thumb pic={thumb} />
      </div>

      <div className="mt-4">
        <Description info={currentTrack} />
      </div>

      <div className="mt-2">
        <Controls />
      </div>

      {upNext.length > 0 && (
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          <p className="hifi-eyebrow mb-2">Playing Next</p>
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1">
            {upNext.map((track, i) => {
              const realIndex = playIndex + 1 + i;
              return (
                <button
                  key={`${track.id || track.videoId}-${realIndex}`}
                  type="button"
                  className="hifi-rail-upnext-item"
                  onClick={() => playQueueIndex(realIndex)}
                >
                  <span className="truncate w-full">
                    {track.title || "Unknown Title"}
                  </span>
                  <span className="hifi-eyebrow normal-case tracking-normal opacity-60 text-[0.65rem]">
                    {track.channel || "Unknown Artist"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};

export default NowPlayingRail;
