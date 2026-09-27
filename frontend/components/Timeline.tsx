"use client";

import { motion } from "framer-motion";
import { EventItem } from "@/lib/api";

export function Timeline({ events }: { events: EventItem[] }) {
  return (
    <div className="relative pl-6 border-l border-[var(--ink)]/20 space-y-8">
      {events.map((e, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          className="relative"
        >
          <span className="absolute -left-[29px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--sage-deep)]" />
          <p className="text-xs tracking-wide uppercase text-[var(--ink-soft)]">
            {e.date || "Undated"}
          </p>
          <p className="font-display text-lg leading-snug mt-1">{e.event}</p>
          {e.consequences && (
            <p className="text-sm text-[var(--ink-soft)] mt-1">{e.consequences}</p>
          )}
          {e.location && (
            <p className="text-xs text-[var(--ink-soft)]/70 mt-0.5 italic">{e.location}</p>
          )}
          
            {e.source_url && (
                <a
                    href={e.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline decoration-dotted underline-offset-2 text-[var(--terracotta)] mt-1 inline-block"
                >
                    Source
                </a>
                )}
        </motion.div>
      ))}
    </div>
  );
}