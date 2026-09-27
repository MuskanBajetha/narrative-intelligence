"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface DashboardEntry {
  topic: string;
  searched_at: string;
  documentary_title: string;
  cover_image: string | null;
  reading_minutes: number;
  evidence_score: number | null;
  source_count: number;
  chapter_count: number;
  year_labels: string[];
}

export function InvestigationCard({
  entry,
  index,
}: {
  entry: DashboardEntry;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={`/story?topic=${encodeURIComponent(entry.topic)}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -10 }}
      className="relative rounded-sm overflow-hidden"
      style={{
        backgroundColor: "#FBE9D0",
        boxShadow: hovered
          ? "0 20px 40px rgba(36,41,31,0.25)"
          : "0 4px 10px rgba(36,41,31,0.12)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* archive tab */}
      <div
        className="absolute -top-1 left-6 px-3 py-1 text-[9px] font-mono uppercase tracking-widest z-10"
        style={{
          backgroundColor: "#244855",
          color: "#FBE9D0",
        }}
      >
        Case {String(index + 1).padStart(2, "0")}
      </div>

      {/* image with folded-corner treatment */}
      <div
        className="relative h-36 overflow-hidden"
        style={{ backgroundColor: "#8E8D8A" }}
      >
        {entry.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.cover_image}
            alt=""
            className="w-full h-full object-cover grayscale-[20%] sepia-[10%]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-xs text-white/60">
              no image
            </span>
          </div>
        )}

        <div
          className="absolute bottom-0 right-0 w-6 h-6"
          style={{
            background:
              "linear-gradient(135deg, transparent 50%, #FBE9D0 50%)",
          }}
        />
      </div>

      <div className="p-5 pt-4">
        <p
          className="font-display text-lg font-bold leading-snug mb-2"
          style={{ color: "#24291f" }}
        >
          {entry.documentary_title || entry.topic}
        </p>

        <div
          className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wide mb-3"
          style={{ color: "#874F41" }}
        >
          <span>
            {new Date(entry.searched_at).toLocaleDateString()}
          </span>

          <span>·</span>

          <span>{entry.reading_minutes} min read</span>
        </div>

        {/* tiny timeline preview */}
        {entry.year_labels.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {entry.year_labels.slice(0, 6).map((y, i) => (
              <div
                key={i}
                className="flex-1 h-0.5 rounded-full"
                style={{ backgroundColor: "#90AEAD" }}
              />
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-between pt-3 border-t"
          style={
            {
              borderColor: "#24291f",
              borderOpacity: 0.1,
            } as any
          }
        >
          <div>
            <p
              className="text-[9px] font-mono uppercase tracking-widest"
              style={{ color: "#8E8D8A" }}
            >
              Evidence
            </p>

            <p
              className="font-display font-bold text-sm"
              style={{ color: "#24291f" }}
            >
              {entry.evidence_score ?? "—"}%
            </p>
          </div>

          <div>
            <p
              className="text-[9px] font-mono uppercase tracking-widest"
              style={{ color: "#8E8D8A" }}
            >
              Sources
            </p>

            <p
              className="font-display font-bold text-sm"
              style={{ color: "#24291f" }}
            >
              {entry.source_count}
            </p>
          </div>

          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-[9px] font-mono uppercase tracking-widest"
                style={{ color: "#E64833" }}
              >
                Reopen →
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.a>
  );
}
