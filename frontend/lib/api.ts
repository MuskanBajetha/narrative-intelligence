export interface EventItem {
  event: string;
  date: string | null;
  participants: string[];
  location: string | null;
  consequences: string | null;
  source_url: string;
}

export interface Evidence {
  evidence_strength: number;
  reasoning: string;
  confidence_label: string;
}

export interface Narrative {
  narrative_name: string;
  summary: string;
  stance_balance: string;
  strength: string;
  claims: string[];
  evidence?: Evidence;
}

export interface ChapterImage {
  url: string;
  description: string;
}

export interface Chapter {
  chapter_number: number;
  title: string;
  year_label?: string;
  tagline?: string;
  narrative_prose?: string;
  events: EventItem[];
  relevant_narrative_names: string[];
  contradiction_focus: string | null;
  confidence_note: string;
  images?: ChapterImage[];
}

export interface InvestigationResult {
  topic: string;
  documentary_title?: string;
  investigation_hook?: string; 
  chapters: Chapter[];
  scored_narratives: Narrative[];
  loop_count: number;
}

export interface NewsArticle {
  headline: string;
  snippet: string;
  publication: string;
  date: string;
  url: string;
}

export interface InvestigationResult {
  topic: string;
  documentary_title?: string;
  investigation_hook?: string;
  chapters: Chapter[];
  scored_narratives: Narrative[];
  news_articles?: NewsArticle[];
  loop_count: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface ProgressEvent {
  message: string;
  node: string;
}

export function storyUrl(topic: string): string {
  return `/story?topic=${encodeURIComponent(topic)}`;
}

export function investigateStream(
  topic: string,
  onProgress: (e: ProgressEvent) => void,
  onDone: (result: InvestigationResult) => void,
  onError: (message: string) => void,
  forceRefresh = false,
  googleId?: string,
  email?: string,
  name?: string
) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/investigate/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          force_refresh: forceRefresh,
          google_id: googleId,
          email,
          name,
        }),
        signal: controller.signal,
      });
      

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const chunk of events) {
          const lines = chunk.split("\n");
          const eventType = lines.find((l) => l.startsWith("event:"))?.slice(7).trim();
          const dataLine = lines.find((l) => l.startsWith("data:"))?.slice(5).trim();
          if (!eventType || !dataLine) continue;

          const data = JSON.parse(dataLine);
          if (eventType === "progress") onProgress(data);
          else if (eventType === "done") onDone(data);
          else if (eventType === "error") onError(data.message);
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") onError(e.message);
    }
  })();

  return () => controller.abort();
}

export async function getCachedInvestigation(topic: string): Promise<InvestigationResult | null> {
  const res = await fetch(`${API_BASE}/api/investigate/${encodeURIComponent(topic)}`);
  if (!res.ok) return null;
  return res.json();
}