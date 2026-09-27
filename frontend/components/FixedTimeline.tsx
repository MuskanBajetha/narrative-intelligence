"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chapter } from "@/lib/api";

export function FixedTimeline({ chapters, dateRange }: { chapters: Chapter[]; dateRange: string }) {
  const [expanded, setExpanded] = useState(false);
  const [startYear, endYear] = dateRange.split("—").map((s) => s.trim());

  function scrollToChapter(chapterNumber: number) {
    document.getElementById(`chapter-${chapterNumber}`)?.scrollIntoView({ behavior: "smooth" });
    setExpanded(false);
  }

  if (!dateRange) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex justify-end"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ width: 140, opacity: 0.6 }}
            animate={{ width: Math.max(420, chapters.length * 90), opacity: 1 }}
            exit={{ width: 140, opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="flex items-center justify-between gap-3 bg-[var(--parchment)]/97 px-6 py-4 rounded-full border border-[var(--ink)]/15 shadow-lg overflow-hidden"
          >
            <span className="font-display font-bold text-lg shrink-0">{startYear}</span>

            <div className="flex-1 flex items-end justify-between relative h-10 px-2">
              <div className="absolute left-0 right-0 h-px bg-[var(--ink)]/30 bottom-3" />
              {chapters.map((ch) => (
                <button
                  key={ch.chapter_number}
                  onClick={() => scrollToChapter(ch.chapter_number)}
                  className="group relative flex flex-col items-center"
                  style={{ minWidth: 44 }}
                >
                  <span className="absolute -top-4 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity text-[var(--terracotta)] whitespace-nowrap">
                    {ch.year_label}
                  </span>
                  <span className="w-0.5 h-4 bg-[var(--ink)]/40 group-hover:h-7 group-hover:bg-[var(--terracotta)] group-hover:w-1 transition-all mb-3 rounded-full" />
                </button>
              ))}
            </div>

            <span className="font-display font-bold text-lg shrink-0">{endYear}</span>
          </motion.div>
        ) : (
          <motion.span
            key="collapsed"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-base bg-[var(--parchment)]/90 px-4 py-2.5 rounded-full border border-[var(--ink)]/15 shadow-sm whitespace-nowrap"
          >
            {dateRange}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}