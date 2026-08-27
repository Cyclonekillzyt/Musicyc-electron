import Controls from "../components/Controls";
import Description from "../components/Description";
import Header from "../components/Header";
import Thumb from "../components/Thumb";
import { usePlayer } from "../context/PlayerContext";

const MusicPlayer = () => {
  const { currentTrack, playAudio } = usePlayer();
  const thumb = currentTrack?.thumbnails?.high?.url ?? null;

  return (
    <div className="flex flex-col h-full min-h-0 w-[92%] max-w-2xl hifi-page-pad py-8">
      <div className="hifi-hide-compact shrink-0">
        <Header />
      </div>

      <div className="hifi-panel flex-1 min-h-0 p-6 flex flex-col gap-4">
        <span className="hifi-screw hifi-screw-tl" />
        <span className="hifi-screw hifi-screw-tr" />
        <span className="hifi-screw hifi-screw-bl" />
        <span className="hifi-screw hifi-screw-br" />

        <div className="flex-1 min-h-0 w-full">
          <Thumb pic={thumb} />
        </div>

        <div className="shrink-0 flex flex-col gap-3">
          <div className="hifi-hide-mini">
            <Description info={currentTrack} />
          </div>
          <Controls />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
