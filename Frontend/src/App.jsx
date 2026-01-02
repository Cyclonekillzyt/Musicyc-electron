import MusicPlayer from "./pages/MusicPlayer"
import { Route, Routes } from "react-router-dom"
import SearchPage from "./pages/SearchPage"
import DownloadPage from "./pages/DownloadPage.jsx"
import PlaylistPage from "./pages/PlaylistPage.jsx"

const App = () => {
  return (
    <div data-theme="dark" className=" bg-base-200 h-screen w-screen overflow-hidden flex justify-center items-center flex-col
    ">
      <Routes>
        <Route path="/" element={<MusicPlayer />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/download" element={<DownloadPage/>}/>
      </Routes>
    </div>
    
  )
}

export default App