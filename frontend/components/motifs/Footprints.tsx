export function Footprints({ color = "var(--ink)", opacity = 0.15 }: { color?: string; opacity?: number }) {
  return (
    <svg viewBox="0 0 400 100" className="w-full h-16" fill={color} opacity={opacity}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ellipse
          key={i}
          cx={30 + i * 65}
          cy={i % 2 === 0 ? 30 : 60}
          rx="14"
          ry="22"
          transform={`rotate(${i % 2 === 0 ? -12 : 12} ${30 + i * 65} ${i % 2 === 0 ? 30 : 60})`}
        />
      ))}
    </svg>
  );
}