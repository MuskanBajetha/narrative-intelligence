export function NewsColumnSilhouette() {
  return (
    <svg viewBox="0 0 400 600" className="w-full h-full opacity-80">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 130}, ${i % 2 === 0 ? 0 : 60})`}>
          <rect x="20" y="20" width="90" height="500" fill="#FBE9D0" opacity="0.15" />
          <rect x="30" y="40" width="70" height="8" fill="#FBE9D0" opacity="0.4" />
          <rect x="30" y="60" width="50" height="4" fill="#FBE9D0" opacity="0.25" />
          <rect x="30" y="72" width="60" height="4" fill="#FBE9D0" opacity="0.25" />
          <rect x="30" y="84" width="45" height="4" fill="#FBE9D0" opacity="0.25" />
        </g>
      ))}
    </svg>
  );
}