import { DownloadIcon } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { handleDownload } from "./Download.jsx";

const Description = ({ info }) => {
  const { setDownload } = usePlayer();
  const handleClick = () => {
    if (!info) return;
    setDownload(info);
    handleDownload(info);
  };
  return (
    <div className="card py-4 flex justify-center items-center  text-center gap-2">
      <h2 className="card-title">{info ? info.title : "Song Title"}</h2>
      <p>{info ? info.channel : "Artist Name"}</p>
      <DownloadIcon
        className="absolute top-[30%] right-[4%] cursor-pointer hover:scale-120 hover:glass rounded-full hover:p-1"
        onClick={handleClick}
      />
    </div>
  );
};

export default Description;
