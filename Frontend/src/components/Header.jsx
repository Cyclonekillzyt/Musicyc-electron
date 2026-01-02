import { ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    console.log("Navigating to search page");
    navigate("/search")
 }

  return (
    <div className="flex  justify-between items-center gap-10 mb-10">
      <div className="bg-primary px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-primary/80 transition">
        <ChevronDown />
      </div>
      <div className="relative">
        <input
          type="search"
          className="bg-white rounded-2xl p-2 text-black "
          onClick={(e) => {
            handleClick(e);
          }}
         
        />
        <button
          className="absolute hover:cursor-pointer text-gray-500 top-0 right-0 p-2"
        >
          <Search />
        </button>
      </div>
    </div>
  );
};

export default Header;
