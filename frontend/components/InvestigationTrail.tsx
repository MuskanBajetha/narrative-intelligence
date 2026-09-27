"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);


export function InvestigationTrail({ chapterCount }: { chapterCount: number }) {
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;

    const length = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });

    const tween = gsap.to(pathRef.current, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      },
    });

    if (dotRef.current) {
      gsap.to(dotRef.current, {
        motionPath: { path: pathRef.current, align: pathRef.current },
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
    }

    return () => {
      tween.scrollTrigger?.kill();
    };
  }, [chapterCount]);

  // A gently wandering vertical path down the right edge — like a hand-drawn
  // investigation route, not a straight ruler line.
  const points = Array.from({ length: chapterCount + 1 }, (_, i) => {
    const y = (i / chapterCount) * 100;
    const x = 50 + (i % 2 === 0 ? -8 : 8);
    return `${x},${y}`;
  });
  const d = `M ${points.map((p, i) => (i === 0 ? p : `L ${p}`)).join(" ")}`.replace(/(\d+),(\d+)/g, (_, x, y) => `${x} ${(Number(y) / 100) * 3000}`);

  return (
    <div className="hidden lg:block fixed right-12 top-0 h-full w-24 z-0 pointer-events-none">
      <svg width="100%" height="3000" viewBox="0 0 100 3000" preserveAspectRatio="none" className="h-full">
        <path
          ref={pathRef}
          d={d}
          stroke="var(--terracotta)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
          opacity="0.5"
        />
        <circle ref={dotRef} r="4" fill="var(--terracotta)" />
      </svg>
    </div>
  );
}