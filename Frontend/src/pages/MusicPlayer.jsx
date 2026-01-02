import Controls from "../components/Controls";
import Description from "../components/Description";
import Header from "../components/Header";
import Thumb from "../components/Thumb";
import { usePlayer } from "../context/PlayerContext";
import { useEffect, useRef } from "react";

const MusicPlayer = () => {
  const { currentTrack, playAudio } = usePlayer();
  const thumb = currentTrack?.thumbnails?.high?.url ?? null;
  
   useEffect(() => {
    if (!currentTrack) return;
    playAudio(currentTrack.videoId);
  }, [currentTrack]);


  return (
    <div className=" flex flex-col h-full  overflow-hidden py-10 w-[60%] ">
      <Header />
      <div className="card bg-base-300 border border-amber-300 w-full h-full p-8 flex flex-col gap-4">
        <div className="card  bg-accent-content border border-amber-300 w-full h-3/4">
          <Thumb pic={thumb} />
        </div>

        <div className="card  border border-amber-300 w-full h-1/4 flex flex-col justify-between gap-">
          <Description info={currentTrack} />
          <Controls />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
