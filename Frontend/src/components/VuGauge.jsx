// Purely decorative — mirrors the twin VU meters in the reference image.
// It isn't wired to real audio levels (the app doesn't do audio
// analysis), it just sweeps while something is playing and rests
// at idle otherwise, the same way the existing hifi-vu bars do.
const VuGauge = ({ label, active }) => {
  const ticks = Array.from({ length: 9 }, (_, i) => i);

  return (
    <div className="hifi-vu-gauge">
      <svg viewBox="0 0 120 70" className="hifi-vu-gauge-face">
        <path
          d="M8,62 A52,52 0 0 1 112,62"
          fill="none"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="2"
        />
        {ticks.map((i) => {
          const angle = -180 + (i * 180) / (ticks.length - 1);
          const rad = (angle * Math.PI) / 180;
          const x1 = 60 + 46 * Math.cos(rad);
          const y1 = 62 + 46 * Math.sin(rad);
          const x2 = 60 + 52 * Math.cos(rad);
          const y2 = 62 + 52 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i >= 6 ? "var(--peak)" : "rgba(111,224,210,0.6)"}
              strokeWidth="1.5"
            />
          );
        })}
        <g
          className={`hifi-vu-needle ${active ? "is-active" : ""}`}
          style={{ transformOrigin: "60px 62px" }}
        >
          <line
            x1="60"
            y1="62"
            x2="60"
            y2="16"
            stroke="var(--brass-bright)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <circle cx="60" cy="62" r="4" fill="var(--brass)" />
      </svg>
      <span className="hifi-vu-gauge-label">{label}</span>
    </div>
  );
};

export default VuGauge;
