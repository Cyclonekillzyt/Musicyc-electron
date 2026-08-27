import Result from "../../components/Result";
import { usePlayer } from "../../context/PlayerContext";

const HistoryDashboard = () => {
  const { history } = usePlayer();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="hifi-eyebrow">This session</p>
        <h1
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--cream)" }}
        >
          History
        </h1>
      </div>

      <div className="flex flex-col gap-1.5">
        {history.length === 0 ? (
          <p className="hifi-eyebrow normal-case tracking-normal opacity-60 text-sm mt-6">
            Nothing played yet this session
          </p>
        ) : (
          history.map((track, index) => (
            <Result
              key={`${track.id || track.videoId}-${index}`}
              data={track}
              list={history}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryDashboard;
