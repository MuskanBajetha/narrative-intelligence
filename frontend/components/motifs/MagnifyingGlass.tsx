export function MagnifyingGlass({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      <circle cx="85" cy="85" r="55" stroke="var(--ink)" strokeWidth="6" opacity="0.15" />
      <line x1="125" y1="125" x2="175" y2="175" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" opacity="0.15" />
    </svg>
  );
}