import { Chapter, Narrative } from "@/lib/api";
import { NarrativeCard } from "./NarrativeCard";

export function ChapterView({
  chapter,
  allNarratives,
}: {
  chapter: Chapter;
  allNarratives: Narrative[];
}) {
  const relevantNarratives = allNarratives.filter((n) =>
    chapter.relevant_narrative_names.includes(n.narrative_name)
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-neutral-400 mb-1">Chapter {chapter.chapter_number}</p>
        <h2 className="text-2xl font-bold">{chapter.title}</h2>
        <p className="text-neutral-600 mt-2">{chapter.narrative_prose}</p>
      </div>

      {chapter.contradiction_focus && (
        <div className="border-l-4 border-amber-400 bg-amber-50 p-3 rounded-r-md">
          <p className="text-sm font-medium text-amber-900">Contested in this chapter</p>
          <p className="text-sm text-amber-800">{chapter.contradiction_focus}</p>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
          Timeline
        </h3>
        <div className="space-y-3">
          {chapter.events.map((e, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-24 shrink-0 text-xs text-neutral-400 pt-0.5">{e.date || "—"}</div>
              <div className="flex-1 border-l-2 border-neutral-200 pl-3 pb-3">
                <p className="text-sm font-medium">{e.event}</p>
                {e.consequences && (
                  <p className="text-xs text-neutral-500">{e.consequences}</p>
                )}
                {e.location && (
                  <p className="text-xs text-neutral-400">{e.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {relevantNarratives.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 mb-2 uppercase tracking-wide">
            Competing narratives
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {relevantNarratives.map((n) => (
              <NarrativeCard key={n.narrative_name} narrative={n} />
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400 italic">{chapter.confidence_note}</p>
    </div>
  );
}