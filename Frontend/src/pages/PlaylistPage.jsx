import Header from "../components/Header";
import { usePlayer } from "../context/PlayerContext";
import Result from "../components/Result";

const PlaylistPage = () => {
  const { playlist } = usePlayer();

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden hifi-page-pad py-8 w-[92%] max-w-2xl">
      <div className="hifi-panel w-full flex-1 min-h-0 p-7 flex flex-col gap-5">
        <span className="hifi-screw hifi-screw-tl" />
        <span className="hifi-screw hifi-screw-tr" />
        <span className="hifi-screw hifi-screw-bl" />
        <span className="hifi-screw hifi-screw-br" />

        <div className="hifi-hide-compact shrink-0">
          <Header />
        </div>

        <div className="mb-1 hifi-hide-mini shrink-0">
          <p className="hifi-eyebrow">Local library</p>
          <h1
            className="text-xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
          >
            Your Collection
          </h1>
        </div>

        <div className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {playlist.length === 0 ? (
            <p className="text-center mt-10 hifi-eyebrow normal-case tracking-normal opacity-60">
              No records on the shelf yet
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

export default PlaylistPage;
