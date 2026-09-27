"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProgressEvent } from "@/lib/api";

export function CinematicLoader({ log }: { log: ProgressEvent[] }) {
  const current = log[log.length - 1];

  return (
    <div className="flex flex-col items-center py-16">
      <div className="relative w-40 h-40">
        <motion.div
          className="absolute inset-0 rounded-full border border-[var(--ink)]/15"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border border-dashed border-[var(--terracotta)]/40"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
        />
        {/* converging particles */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[var(--sage-deep)]"
              style={{ top: "50%", left: "50%" }}
              animate={{
                x: [Math.cos(angle) * 60, 0, Math.cos(angle) * 60],
                y: [Math.sin(angle) * 60, 0, Math.sin(angle) * 60],
                opacity: [0.2, 0.9, 0.2],
              }}
              transition={{ repeat: Infinity, duration: 3.5, delay: i * 0.2, ease: "easeInOut" }}
            />
          );
        })}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)]">
            {log.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="mt-8 h-6 relative w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          {current && (
            <motion.p
              key={current.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="font-mono text-sm text-[var(--ink-soft)]"
            >
              {current.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-1.5">
        {log.map((_, i) => (
          <span key={i} className="w-1 h-1 rounded-full bg-[var(--sage-deep)]" />
        ))}
      </div>
    </div>
  );
}