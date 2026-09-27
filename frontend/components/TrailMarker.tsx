"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Positions a child element at a given percentage along an SVG path, and
 * calls onEnter() once when it scrolls into view (fires only once per mount).
 */
export function TrailMarker({
  pathD,
  viewBox,
  percent,
  onEnter,
  children,
}: {
  pathD: string;
  viewBox: string;
  percent: number; // 0–100, how far along the path this marker sits
  onEnter?: () => void;
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    // Build an off-DOM path just to measure a point along it — cheap, no rendering cost.
    const svgNS = "http://www.w3.org/2000/svg";
    const tempPath = document.createElementNS(svgNS, "path");
    tempPath.setAttribute("d", pathD);
    const length = tempPath.getTotalLength();
    const point = tempPath.getPointAtLength((percent / 100) * length);

    const [, , vbW, vbH] = viewBox.split(" ").map(Number);
    setPos({ x: (point.x / vbW) * 100, y: (point.y / vbH) * 100 });
  }, [pathD, viewBox, percent]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          onEnter?.();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, [onEnter]);

  if (!pos) return null;

  return (
    <div
      ref={wrapperRef}
      className="absolute z-10"
      style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
    >
      {children}
    </div>
  );
}