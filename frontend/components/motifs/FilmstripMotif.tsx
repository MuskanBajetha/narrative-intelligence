export function FilmstripMotif() {
  return (
    <svg viewBox="0 0 300 500" className="w-full h-full opacity-80">
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={20 + i * 12}
          y={40 + i * 30}
          width="220"
          height="140"
          fill={["#874F41", "#E64833", "#E98074", "#90AEAD"][i]}
          opacity="0.3"
          transform={`rotate(${i % 2 === 0 ? -2 : 2} ${130 + i * 12} ${110 + i * 30})`}
        />
      ))}
    </svg>
  );
}