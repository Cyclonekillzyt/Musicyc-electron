import Result from "../../components/Result";
import CacheManager from "../../components/CacheManager";
import { usePlayer } from "../../context/PlayerContext";

const DownloadsDashboard = () => {
  const { playlist } = usePlayer();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="hifi-eyebrow">Downloaded</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Downloads
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        <CacheManager />
      </div>

      <div>
        <h3
          className="text-lg mb-3"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Downloaded Tracks
        </h3>
        <div className="flex flex-col gap-1.5">
          {playlist.length === 0 ? (
            <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm">
              Nothing downloaded yet — download a track from search results
            </p>
          ) : (
            playlist.map((track, index) => (
              <Result key={track.id} data={track} list={playlist} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DownloadsDashboard;
