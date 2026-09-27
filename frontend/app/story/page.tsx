"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCachedInvestigation, InvestigationResult } from "@/lib/api";
import { TopicCover } from "@/components/TopicCover";
import { ChapterSection } from "@/components/ChapterSection";
import { AmbientBackground } from "@/components/AmbientBackground";
import { computeDateRange } from "@/lib/dateRange";
import { EvidenceBoard } from "@/components/EvidenceBoard";
import { shouldShowEvidenceBoardAfter } from "@/lib/evidenceBoardLogic";
import { CursorTrail } from "@/components/CursorTrail";
import { FixedTimeline } from "@/components/FixedTimeline";
import { ChapterIntro } from "@/components/ChapterIntro";
import { ChapterTintProvider } from "@/components/ChapterTintContext";

function StoryContent() {
  const params = useSearchParams();
  const topic = params.get("topic") || "";
  const [result, setResult] = useState<InvestigationResult | null>(null);

  useEffect(() => {
    if (!topic.trim()) return;

    const cached = sessionStorage.getItem(`investigation:${topic}`);

    if (cached) {
      setResult(JSON.parse(cached));
      return;
    }

    getCachedInvestigation(topic).then(setResult);
  }, [topic]);

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center font-mono text-sm text-[var(--ink-soft)]">Loading investigation…</div>;
  }

  const dateRange = computeDateRange(result.chapters);

  return (
    <ChapterTintProvider>
      <main className="grain relative">
        <Link
          href="/dashboard"
          className="fixed top-6 left-6 z-40 font-mono text-xs uppercase tracking-widest px-3 py-2 rounded-full backdrop-blur-sm"
          style={{
            color: "var(--parchment)",
            backgroundColor: "rgba(36,72,85,0.6)",
          }}
        >
          ← Dashboard
        </Link>

        <CursorTrail />
        <FixedTimeline chapters={result.chapters} dateRange={dateRange} />
        <AmbientBackground />
        <TopicCover result={result} />


        <div className="relative">
          {result.chapters.map((chapter, i) => {
            const isFirst = i === 0;
            const isLast = i === result.chapters.length - 1;

            const showBoard = shouldShowEvidenceBoardAfter(
              chapter.chapter_number,
              result.chapters.length
            );

            const chaptersSoFar = result.chapters.slice(0, i + 1);

            const allImagesSoFar = chaptersSoFar.flatMap(
              (c) => c.images || []
            );

            return (
              <div key={chapter.chapter_number} className="relative isolate">
                <ChapterIntro
                  chapterNumber={chapter.chapter_number}
                  title={chapter.title}
                  index={i}
                />

                <ChapterSection
                  chapter={chapter}
                  allNarratives={result.scored_narratives}
                  index={i}
                  dateRange={dateRange}
                  isFirst={isFirst}
                  isLast={isLast}
                />

                {showBoard && (
                  <div className="relative z-30 -mt-1">
                    <EvidenceBoard
                      chaptersSoFar={chaptersSoFar}
                      allNarratives={result.scored_narratives}
                      allImages={allImagesSoFar}
                      newsArticles={result.news_articles || []}
                      confidenceNote={chapter.confidence_note}
                      boardKey={chapter.chapter_number}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </ChapterTintProvider>
  );
}

export default function StoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <StoryContent />
    </Suspense>
  );
}