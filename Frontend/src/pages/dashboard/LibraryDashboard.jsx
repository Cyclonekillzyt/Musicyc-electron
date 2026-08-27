import Result from "../../components/Result";
import { usePlayer } from "../../context/PlayerContext";

const LibraryDashboard = () => {
  const { playlist } = usePlayer();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="hifi-eyebrow">Local library</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          Your Collection
        </h1>
      </div>

      <div className="flex flex-col gap-1.5">
        {playlist.length === 0 ? (
          <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm mt-6">
            No records on the shelf yet
          </p>
        ) : (
          playlist.map((track, index) => (
            <Result key={track.id} data={track} list={playlist} index={index} />
          ))
        )}
      </div>
    </div>
  );
};

export default LibraryDashboard;
