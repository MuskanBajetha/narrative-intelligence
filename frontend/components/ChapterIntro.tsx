"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useChapterTint } from "./ChapterTintContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

gsap.registerPlugin(ScrollTrigger);

const DUOTONES = [
  { fill: "#6b8068" },  // sage
  { fill: "#b5654a" },  // terracotta
  { fill: "#c99a3f" },  // gold
  { fill: "#3f5a44" },  // deep sage
];

export function ChapterIntro({
  chapterNumber,
  title,
  index,
}: {
  chapterNumber: number;
  title: string;
  index: number;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const circlesRef = useRef<SVGSVGElement>(null);
  const { setTint } = useChapterTint();

  const duotone = DUOTONES[index % DUOTONES.length];

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title fades IN only, then stays fully visible for the rest of the
      // section — no fade-out on exit.
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "top 25%",
            scrub: true,
          },
        }
      );

      // Three filled concentric circles, expanding outward and fading as
      // they grow — this is the "burst" effect, independent of the tint.
      if (circlesRef.current) {
        const rings = circlesRef.current.querySelectorAll("circle");
        rings.forEach((ring, i) => {
          gsap.fromTo(
            ring,
            { scale: 0.2, opacity: 0.65 },
            {
              scale: 1 + i * 0.6,
              opacity: 0,
              transformOrigin: "90% 80%",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 80%",
                end: "center 40%",
                scrub: true,
              },
            }
          );
        });
      }

      // Page-wide tint: set once entering this chapter's intro, and it
      // simply STAYS at that color (handled by the shared context) until
      // the next ChapterIntro's own ScrollTrigger overwrites it. No fade-out
      // tied to leaving this section.
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 60%",
        end: "bottom 60%",
        onEnter: () => setTint(duotone.fill),
        onEnterBack: () => setTint(duotone.fill),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [index, duotone.fill, setTint]);

  return (
    <section ref={sectionRef} className="min-h-screen w-full flex items-center justify-center relative overflow-hidden grain">
      <svg
        ref={circlesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      >
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx="750"
            cy="850"
            r={90 + i * 70}
            fill={duotone.fill}
            opacity="0.35"
          />
        ))}
      </svg>

      <div ref={titleRef} className="relative z-10 text-center px-6">
        {/* Lottie behind the title */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div className="w-[2200px] h-[2200px] opacity-60">
                <DotLottieReact
                src="/lottie/Skyline.lottie"
                autoplay
                loop
                className="w-full h-full"
                />
            </div>
            </div>

        <div className="text-center">
            <p className="font-mono text-sm tracking-[0.3em] uppercase text-[var(--terracotta)] mb-4">
            Chapter {String(chapterNumber).padStart(2, "0")}
            </p>

            <h2 className="font-display text-6xl sm:text-8xl font-bold leading-[1.05] max-w-4xl mx-auto">
            {title}
        </h2>
      </div>
      </div>
    </section>
  );
}