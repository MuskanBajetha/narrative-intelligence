/**
 * Decides which chapter indices (0-based) should be followed by an
 * Evidence Board interstitial.
 *
 * Rules (chapter numbers are 1-based, as shown to the user):
 * - 4 or fewer chapters total: show after Chapter 1, Chapter 3, and the
 *   final chapter (only if that final chapter is Chapter 4 — i.e. don't
 *   double-show if the final chapter IS chapter 1 or 3 already).
 * - More than 4 chapters: show after every odd chapter number greater than 4,
 *   and after the final chapter.
 */
export function getEvidenceBoardChapterNumbers(totalChapters: number): Set<number> {
  const result = new Set<number>();

  if (totalChapters >= 1) {
    result.add(1);
    result.add(totalChapters);
  }

  return result;
}

export function shouldShowEvidenceBoardAfter(chapterNumber: number, totalChapters: number): boolean {
  return getEvidenceBoardChapterNumbers(totalChapters).has(chapterNumber);
}