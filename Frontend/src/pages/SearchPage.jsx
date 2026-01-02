import { useState } from "react";
import { Search } from "lucide-react";
import Result from "../components/Result";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    
    try {
      console.log("electronAPI:", window.electronAPI);
      const data =  await window.electronAPI.searchYoutube(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  return (
    <div className=" h-full w-[60%] border border-amber-300 rounded-3xl flex flex-col my-5 justify-between items-center p-10 gap-10">
      <form className="relative w-full" onSubmit={(e) => handleSubmit(e)}>
        <input
          type="search"
          className="glass shadow-lg w-full rounded-2xl py-3  px-6 font-bold   border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute hover:cursor-pointer text-gray-500 top-1 right-1 p-2"
        >
          <Search />
        </button>
      </form>
      <div className=" w-full h-full overflow-y-auto flex flex-col gap-4">
        {results.length === 0 ? (
          <p className=" text-center text-gray-500 mt-10">No results found</p>
        ) : (
          results.map((item, index) => <Result key={index} data={item} />)
        )}
      </div>
    </div>
  );
};

export default SearchPage;
