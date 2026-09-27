"use client";

import { motion } from "framer-motion";
import { InvestigationResult } from "@/lib/api";
import { computeDateRange } from "@/lib/dateRange";
import { TrailPath } from "./TrailPaths";
import { GlobeHero } from "./GlobeHero";

export function TopicCover({ result }: { result: InvestigationResult }) {
  const dateRange = computeDateRange(result.chapters);
  const title = result.documentary_title || result.topic;
  const hook = result.investigation_hook || result.chapters[0]?.tagline || "";

  return (
    <section className="min-h-screen grid lg:grid-cols-2 items-center px-6 sm:px-12 relative grain overflow-hidden">
      
      {/* Trail overlay - removed from layout flow */}
      <TrailPath index={0} offsetTop="72%" />

      {/* Left content */}
      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display text-5xl sm:text-7xl font-black leading-[0.95] max-w-xl"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-mono text-sm tracking-[0.2em] uppercase text-[var(--terracotta)] mt-6"
        >
          {result.chapters[0]?.year_label}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="text-lg text-[var(--ink-soft)] max-w-md mt-3 leading-relaxed"
        >
          {hook}
        </motion.p>
      </div>

      {/* Globe */}
      <div className="hidden lg:block h-[70vh] relative z-10">
        <GlobeHero />
      </div>

    </section>
  );
}