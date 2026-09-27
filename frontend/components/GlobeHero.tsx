"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

gsap.registerPlugin(ScrollTrigger);

export function GlobeHero({ highlightRegion = "asia" }: { highlightRegion?: string }) {
  const globeRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!globeRef.current || !glassRef.current) return;

    // Slow ambient rotation, then settle toward the highlighted region
    const tl = gsap.timeline();
    tl.fromTo(globeRef.current, { rotate: -30 }, { rotate: 0, duration: 2.2, ease: "power2.out" });

    // Magnifying glass "inspects" — subtle zoom in/out loop
    gsap.to(glassRef.current, {
      scale: 1.08,
      duration: 1.6,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // On scroll away from hero, glass shrinks and drifts down toward where
    // the trail begins — a visual handoff rather than an abrupt disappearance.
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full flex items-center justify-center"
    >
      {/* Globe */}
      <div
        ref={globeRef}
        className="w-full max-w-md"
        style={{
          transformOrigin: "center center",
          transform: "scale(2)",
          margin: "4rem auto",
        }}
      >
        <DotLottieReact
          src="https://lottie.host/7dacd732-2712-40e7-b75f-2a7c82f36dd6/CaqcYtFDk3.lottie"
          autoplay
          loop
        />
      </div>

      {/* Magnifying glass overlay */}
      <div
        ref={glassRef}
        className="absolute w-32 h-32"
        style={{
          top: "40%",
          right: "22%",
          transformOrigin: "center center",
          transform: "scale(1.4)",
          margin: "4rem auto",
        }}
      >
        <DotLottieReact
          src="https://lottie.host/faf48894-5926-4110-a260-5f009375abae/k1wttSp2vb.lottie"
          autoplay
          loop
        />
      </div>
    </div>
  );
}