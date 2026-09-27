"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EventItem } from "@/lib/api";

export function ProseNarrative({ text, events }: { text: string; events: EventItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sources = events.filter((e) => e.source_url);

  return (
    <div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="text-lg sm:text-xl leading-[1.8] text-[var(--ink)] font-normal max-w-2xl"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {text}
      </motion.p>

      {sources.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {sources.slice(0, 6).map((e, i) => (
            <div key={i} className="relative">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="text-xs font-mono px-2 py-1 border border-[var(--ink)]/20 rounded-full text-[var(--ink-soft)] hover:border-[var(--terracotta)] hover:text-[var(--terracotta)] transition-colors"
              >
                source {i + 1}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, rotate: -2 }}
                    animate={{ opacity: 1, y: 0, rotate: -1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="absolute z-20 top-8 left-0 w-64 bg-[var(--parchment-deep)] border border-[var(--ink)]/15 shadow-lg p-3 text-xs"
                  >
                    <p className="font-medium text-[var(--ink)]">{e.event}</p>
                    <p className="text-[var(--ink-soft)] mt-1">{e.date} · {e.location || "—"}</p>
                    
                      <a
                        href={e.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-dotted text-[var(--terracotta)] mt-2 inline-block"
                    >
                        open original source
                    </a>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}