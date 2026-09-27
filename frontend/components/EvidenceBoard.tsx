"use client";

import { motion } from "framer-motion";
import { Chapter, Narrative, NewsArticle, ChapterImage } from "@/lib/api";
import { EvidenceStamp } from "./EvidenceStamp";
import { EnlargeableImage } from "./EnlargeableImage";

function relevantNews(news: NewsArticle[]): NewsArticle[] {
  // Trust Guardian's own search relevance (it was already queried with the
  // investigation topic) rather than re-filtering by loose keyword overlap,
  // which let unrelated matches like wine/grapes through for "spread" etc.
  return news.slice(0, 2);
}

const rotations = [-5, 3, -2, 6, -4, 2];

export function EvidenceBoard({
  chaptersSoFar,
  allNarratives,
  allImages,
  newsArticles,
  confidenceNote,
  boardKey,
}: {
  chaptersSoFar: Chapter[];
  allNarratives: Narrative[];
  allImages: ChapterImage[];
  newsArticles: NewsArticle[];
  confidenceNote?: string;
  boardKey: string | number;
}) {
  const news = relevantNews(newsArticles);
  const narrativeNames = new Set(chaptersSoFar.flatMap((c) => c.relevant_narrative_names));
  const narratives = allNarratives.filter((n) => narrativeNames.has(n.narrative_name));

  return (
    <section className="min-h-screen w-full flex items-center justify-center px-6 py-16 grain relative overflow-hidden z-20">
      <motion.div
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.9 }}
        className="w-full max-w-6xl h-[85vh] relative rounded-sm border-2 shadow-2xl overflow-y-auto p-8 sm:p-12 z-20"
        style={{
          backgroundColor: "var(--parchment-deep)",
          borderColor: "rgba(36,72,85,0.2)",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(36,72,85,0.03) 40px)",
        }}
        onWheel={(e) => e.stopPropagation()}
      >

        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--terracotta)] mb-2">
          Evidence Board
        </p>
        <h3 className="font-display text-3xl font-bold mb-8">
          The case so far
        </h3>

        {/* Thread-connected photo cluster */}
        {allImages.length > 0 && (
          <div className="relative mb-14">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
              {allImages.slice(0, -1).map((_, i) => (
                <line
                  key={i}
                  x1={`${10 + i * 18}%`}
                  y1="20%"
                  x2={`${10 + (i + 1) * 18}%`}
                  y2="20%"
                  stroke="var(--terracotta)"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              ))}
            </svg>
            <div className="flex flex-wrap gap-6 relative z-10">
              {allImages.slice(0, 6).map((img, i) => (
                <motion.figure
                  key={i}
                  initial={{ opacity: 0, y: 12, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0, rotate: rotations[i % rotations.length] }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-white p-2 pb-6 shadow-md w-36"
                >
                  <EnlargeableImage
                    src={img.url}
                    alt={img.description || "evidence"}
                    layoutId={`board-${boardKey}-photo-${i}`}
                    className="w-full h-24 object-cover grayscale-[15%] sepia-[8%]"
                  />
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--terracotta)]" />
                  </motion.figure>
              ))}
            </div>
          </div>
        )}

        {/* Headline strip */}
        {news.length > 0 && (
          <div className="mb-14">
            <p className="text-xs uppercase tracking-widest text-[var(--ink-soft)] mb-4">
              From the archives
            </p>
            <div className="space-y-3">
              {news.map((a, i) => (
                <motion.a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ rotate: -1.5, scale: 1.015, backgroundColor: "rgba(255,255,255,0.4)" }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="block border-l-2 border-[var(--ink)]/20 pl-4 py-2 rounded-sm transition-colors"
                >
                  <p className="font-display text-lg leading-snug">{a.headline}</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-1">
                    {a.publication} · {a.date ? new Date(a.date).toLocaleDateString() : "undated"}
                  </p>
                  {a.snippet && (
                    <p className="text-sm text-[var(--ink-soft)] mt-1 line-clamp-2">{a.snippet}</p>
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Competing accounts, now living only here */}
        {narratives.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--ink-soft)] mb-4">
              Competing accounts
            </p>
            <div className="grid sm:grid-cols-2 gap-8">
              {narratives.map((n, i) => (
                <div key={n.narrative_name}>
                  <p className="text-xs uppercase tracking-widest text-[var(--terracotta)] mb-1">
                    {n.stance_balance}
                  </p>
                  <h4 className="font-display text-xl mb-1">{n.narrative_name}</h4>
                  <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{n.summary}</p>
                  {n.evidence && (
                    <EvidenceStamp
                      strength={n.evidence.evidence_strength}
                      label={n.evidence.confidence_label}
                      tiltSeed={i}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {confidenceNote && (
          <motion.div
            initial={{ opacity: 0, rotate: 0 }}
            whileInView={{ opacity: 1, rotate: -2 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 inline-block bg-white px-4 py-3 shadow-sm max-w-sm"
          >
            <p className="text-xs uppercase tracking-widest text-[var(--terracotta)] mb-1">
              Field note
            </p>
            <p className="text-sm text-[var(--ink-soft)] italic">{confidenceNote}</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}