"use client";

import { Chapter } from "@/lib/api";

export function ChapterNav({
  chapters,
  activeIndex,
  onSelect,
}: {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="hidden lg:flex flex-col gap-4 fixed left-8 top-1/2 -translate-y-1/2 z-10">
      {chapters.map((ch, i) => (
        <button
          key={ch.chapter_number}
          onClick={() => onSelect(i)}
          className="group flex items-center gap-3"
          title={ch.title}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === activeIndex
                ? "bg-[var(--sage-deep)] scale-125"
                : "bg-[var(--ink)]/20 group-hover:bg-[var(--ink)]/40"
            }`}
          />
          <span
            className={`text-xs font-mono whitespace-nowrap transition-opacity ${
              i === activeIndex ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            }`}
          >
            {ch.title}
          </span>
        </button>
      ))}
    </div>
  );
}