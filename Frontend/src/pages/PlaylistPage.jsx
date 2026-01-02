import Header from "../components/Header";
import { usePlayer } from "../context/PlayerContext";

const PlaylistPage = () => {
  const {playlist} = usePlayer()
  return (
    <div className=" flex flex-col h-full  overflow-hidden py-10 w-[60%] ">
      <div className="card bg-base-300 border border-amber-300 w-full h-full p-8 flex flex-col gap-4">
        <Header />
        <div className="card bg-base-300 border border-amber-300 w-full h-full p-8 flex flex-col gap-4">
          {playlist.length === 0 ? (
            <p className=" text-center text-gray-500 mt-10">
              No playlist found
            </p>
          ) : (
            playlist.map((item, index) => <Result key={index} data={item} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistPage