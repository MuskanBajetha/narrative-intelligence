"use client";

import { useEffect, useId, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TrailMarker } from "./TrailMarker";

gsap.registerPlugin(ScrollTrigger);

const TRAILS = [
  { viewBox: "0 0 1440 393", d: "M727.178 0.000163453C727.178 0.000163453 657.983 178.389 740.639 277.5C815.381 367.121 1052.14 220 1138.64 364" },
  { viewBox: "0 0 1440 1291", d: "M1155.5 220C1217 747.5 496.105 662 546.5 931.5C592.5 1177.5 425 1290 425 1290" },
  { viewBox: "0 0 1440 1068", d: "M212.616 141C212.616 141 80.9522 413.677 212.616 736.93C344.28 1060.184 698.917 1060.879 698.917 1060.879" },
  { viewBox: "0 0 1440 1479", d: "M1274 19C1274 19 1431.28 237.945 1274 497.5C1116.72 757.055 920.679 803.48 656.5 879C189.5 1012.5 298.964 1450.78 298.964 1450.78" },
  { viewBox: "0 0 1440 1068", d: "M212.616 141C212.616 141 80.9522 413.677 212.616 736.93C344.28 1060.184 698.917 1060.879 698.917 1060.879" },
  { viewBox: "0 0 1440 1479", d: "M1274 19C1274 19 1431.28 237.945 1274 497.5C1116.72 757.055 920.679 803.48 656.5 879C189.5 1012.5 298.964 1450.78 298.964 1450.78" },
  { viewBox: "0 0 1440 1068", d: "M212.616 141C212.616 141 80.9522 413.677 212.616 736.93C344.28 1060.184 698.917 1060.879 698.917 1060.879" },
  { viewBox: "0 0 1440 1479", d: "M1274 19C1274 19 1431.28 237.945 1274 497.5C1116.72 757.055 920.679 803.48 656.5 879C189.5 1012.5 298.964 1450.78 298.964 1450.78" },
  { viewBox: "0 0 1440 1068", d: "M212.616 141C212.616 141 80.9522 413.677 212.616 736.93C344.28 1060.184 698.917 1060.879 698.917 1060.879" },
];

export function TrailPath({
  index,
  offsetTop = "0",
  markers,
}: {
  index: number;
  offsetTop?: string;
  markers?: {
    percent: number;
    onEnter: () => void;
    element: React.ReactNode;
  }[];
}) {
  const uid = useId().replace(/:/g, "");
  const revealPathRef = useRef<SVGPathElement>(null);
  const trail = TRAILS[index % TRAILS.length];
  const [, , , viewH] = trail.viewBox.split(" ").map(Number);
  const viewW = 1440;

  useEffect(() => {
    if (!revealPathRef.current) return;
    const container = revealPathRef.current.closest("[data-trail-container]") as HTMLElement | null;
    if (!container) return;

    const length = revealPathRef.current.getTotalLength();
    gsap.set(revealPathRef.current, { strokeDasharray: length, strokeDashoffset: length });

    const tween = gsap.to(revealPathRef.current, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top 90%",
        end: "bottom 30%",
        scrub: 0.6,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
    };
  }, [index]);

  const maskId = `trail-mask-${uid}`;

  return (
    <div
      data-trail-container
      className="hidden lg:block absolute left-0 right-0 pointer-events-none z-0"
      style={{
        top: offsetTop,
        bottom: 0,
        aspectRatio: `${viewW} / ${viewH}`,
        position: "absolute",
      }}
    >
      <svg width="100%" height="100%" viewBox={trail.viewBox} preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <mask id={maskId}>
            {/* Wide solid stroke used ONLY to build the reveal mask — this is
                what animates via strokeDashoffset. It has no dot pattern of
                its own, so overriding its dasharray to the full path length
                (the standard "draw-in" trick) is safe here. */}
            <path
              ref={revealPathRef}
              d={trail.d}
              stroke="white"
              strokeWidth="24"
              fill="none"
              strokeLinecap="round"
            />
          </mask>
        </defs>

        {/* The ACTUAL visible dotted path — its own dasharray is untouched,
            so the dots stay dots. The mask above just reveals more of it as
            you scroll, instead of the dash pattern itself being animated. */}
        <path
          d={trail.d}
          stroke="#1F1D1E"
          strokeWidth="2"
          strokeDasharray="10 10"
          fill="none"
          opacity="0.22"
          mask={`url(#${maskId})`}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

        {markers?.map((m, i) => (
          <TrailMarker
            key={i}
            pathD={trail.d}
            viewBox={trail.viewBox}
            percent={m.percent}
            onEnter={m.onEnter}
          >
            <div className="pointer-events-auto">
              {m.element}
            </div>
          </TrailMarker>
        ))}

        </div>
  );
}