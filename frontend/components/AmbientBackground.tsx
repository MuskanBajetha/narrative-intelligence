"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function AmbientBackground() {
  const contourRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!contourRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.to(contourRef.current, {
      x: 40,
      y: -20,
      duration: 40,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.06]">
      <svg width="100%" height="100%">
        <g ref={contourRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <path
              key={i}
              d={`M -100 ${80 * i} Q 400 ${80 * i + 60}, 900 ${80 * i} T 1900 ${80 * i}`}
              stroke="var(--ink)"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}