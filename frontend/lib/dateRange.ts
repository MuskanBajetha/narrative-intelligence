import { Chapter } from "./api";

export function computeDateRange(chapters: Chapter[]): string {
  const allDates = chapters
    .flatMap((c) => c.events.map((e) => e.date))
    .filter((d): d is string => !!d && d.toLowerCase() !== "null" && d.toLowerCase() !== "unknown");

  const parsed = allDates
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  if (parsed.length === 0) return "";

  const start = parsed[0].getFullYear();
  const end = parsed[parsed.length - 1].getFullYear();
  return start === end ? `${start}` : `${start} — ${end}`;
}