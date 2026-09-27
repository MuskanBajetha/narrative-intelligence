"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chapter, Narrative } from "@/lib/api";
import { ChapterIllustration } from "./ChapterIllustration";
import { ProseNarrative } from "./ProseNarrative";
import { TrailPath } from "./TrailPaths";
import { useFootprintsMarker } from "./FootprintsTrailMarker";
import { AlwaysLoopingLottie } from "./AlwaysLoopingLottie";

gsap.registerPlugin(ScrollTrigger);

export function ChapterSection({
  chapter,
  allNarratives,
  index,
  dateRange,
  isFirst,
  isLast,
}: {
  chapter: Chapter;
  allNarratives: Narrative[];
  index: number;
  dateRange: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const footprints = useFootprintsMarker();

  const glassesElement = (
    <AlwaysLoopingLottie
      src="/lottie/glasses.json"
      className="w-96 h-60 opacity-80"
    />
  );

  const woodpeckerElement = (
    <AlwaysLoopingLottie
      src="/lottie/woodpecker.json"
      className="w-64 h-40 opacity-80"
    />
  );

  const documentElement = (
    <AlwaysLoopingLottie
      src="/lottie/document-edit.json"
      className="w-48 h-32 opacity-80"
    />
  );

  const trailMarkers =
    index === 0
      ? [
          {
            percent: 70,
            onEnter: () => {},
            element: glassesElement,
          },
        ]
      : index === 1
      ? [
          {
            percent: 50,
            onEnter: footprints.onEnter,
            element: footprints.element,
          },
        ]
      : index === 2
      ? [
          {
            percent: 9,
            onEnter: () => {},
            element: woodpeckerElement,
          },
        ]
      : index === 3
      ? [
          {
            percent: 12,
            onEnter: () => {},
            element: (
              <div className="-translate-x-14">
                {documentElement}
              </div>
            ),
          },
        ]
      : undefined;

  const showTrail = !isFirst && !isLast;

  const sectionHeightClass =
    isFirst || isLast
      ? "min-h-screen"
      : "min-h-[140vh]";

  useEffect(() => {
    if (!sectionRef.current || !stickyRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(stickyRef.current, {
        opacity: 0,
        y: -30,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "bottom 35%",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id={`chapter-${chapter.chapter_number}`}
      ref={sectionRef}
      className={`relative ${sectionHeightClass} w-full py-20 px-6 sm:px-12 grain overflow-hidden`}
    >
      {/* Trail overlay */}
      {showTrail && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <TrailPath
            index={index + 1}
            markers={trailMarkers}
          />
        </div>
      )}

      {/* Content layer */}
      <div className="relative z-10 max-w-6xl mx-auto grid lg:grid-cols-[1fr_1.4fr] gap-16">

        {/* LEFT: pinned chapter card */}
        <div
          className="lg:sticky lg:top-24 lg:self-start h-fit relative"
          ref={stickyRef}
        >
          <div className="absolute -top-6 -left-4 -z-10 opacity-90 w-[120%]">
            <ChapterIllustration seed={index} />
          </div>

          <div className="relative bg-[var(--parchment)]/90 backdrop-blur-[1px] pt-2 pr-6 pb-2">
            <div className="flex items-center gap-2 mb-6">
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs"
                style={{
                  backgroundColor: "var(--deep-teal)",
                  color: "var(--parchment)",
                }}
              >
                ◆
              </span>

              <p
                className="font-serif text-sm tracking-[0.15em] uppercase"
                style={{
                  color: "var(--deep-teal)",
                }}
              >
                Chapter {chapter.chapter_number}
              </p>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] text-[var(--ink)]">
              {chapter.title}
            </h2>

            <p className="mt-4 text-[var(--ink-soft)] text-base leading-relaxed max-w-sm">
              {chapter.tagline}
            </p>

            {chapter.contradiction_focus && (
              <div
                className="mt-6 border-l-2 pl-4 py-1 max-w-sm"
                style={{
                  borderColor: "var(--rust)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{
                    color: "var(--rust)",
                  }}
                >
                  Where accounts diverge
                </p>

                <p
                  className="text-sm italic"
                  style={{
                    color: "var(--ink-soft)",
                  }}
                >
                  {chapter.contradiction_focus}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: prose */}
        <div className="relative pt-2">
          <ProseNarrative
            text={
              chapter.narrative_prose ||
              chapter.tagline ||
              ""
            }
            events={chapter.events}
          />

          <p className="text-xs text-[var(--ink-soft)]/50 italic mt-12">
          </p>
        </div>
      </div>
    </section>
  );
}
