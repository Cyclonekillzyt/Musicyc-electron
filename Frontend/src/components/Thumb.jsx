import { useEffect, useRef, useState } from "react";
import sas from "../assets/sasa.png";
import { usePlayer } from "../context/PlayerContext";

const Thumb = ({ pic }) => {
  const { isPlaying } = usePlayer();
  const containerRef = useRef(null);
  const [size, setSize] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize(Math.max(0, Math.floor(Math.min(width, height))));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center"
    >
      <div
        className="hifi-turntable"
        style={{ width: size || "100%", height: size || "100%" }}
      >
        <div className={`hifi-record ${isPlaying ? "is-playing" : ""}`}>
          <div className="hifi-record-label">
            <img src={pic || sas} alt="" />
          </div>
          <div className="hifi-spindle" />
        </div>

        <div className={`hifi-tonearm ${isPlaying ? "is-playing" : ""}`}>
          <div className="hifi-tonearm-pivot" />
          <div className="hifi-tonearm-body" />
          <div className="hifi-tonearm-head" />
        </div>
      </div>
    </div>
  );
};

export default Thumb;
