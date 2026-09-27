import json

from app.core.llm_router import call_llm

STORY_ARCHITECT_PROMPT = """You are a documentary story architect and narrative writer for an investigative journalism tool.

First, determine the TOTAL TIME SPAN covered by the EVENTS below (earliest
event date to latest event date).

Then decide the number of chapters based on that span:
- If the span covers more than ~18 months (multi-year story, e.g. a war or
  a multi-year investigation): use 6-8 chapters, with major distinct
  sub-periods or years each getting their own chapter — do not compress a
  multi-year story into 3 chapters.
- If the span covers roughly 6-18 months: use 4-6 chapters.
- If the span is a single short burst (days to a few months): 3-5 chapters
  is appropriate.
- Never produce fewer than 3 chapters regardless of span.

Write THREE distinct pieces of copy, each with its own voice — none should
repeat or closely resemble each other:

1. documentary_title: punchy overall title, 4-7 words (e.g. "The NEET Fiasco of 2026")
2. investigation_hook: TWO short, punchy sentences for the cover screen that
   create curiosity — a hook, not a summary. Example style: "Uncover how an
   underground network hijacked the infamous education system — and what it
   means for the future of India's medical entrance system." This must be
   DIFFERENT from any chapter's tagline.
3. For each chapter, a "tagline": ONE punchy, witty sentence capturing that
   chapter's hook. NEVER start with "This chapter introduces/covers/details/
   examines" or similar generic openers — write it like a magazine pull-quote.

For each chapter's narrative_prose, apply this length rule based on the
chapter's position in the sequence:
- If it is chapter_number 1, OR it is the LAST chapter in the whole sequence:
  write 80-100 words — a tight, punchy open or close.
- For every chapter in between (chapter 2 through the second-to-last):
  write 140-160 words — enough room to develop the story's middle. It should be 
  divided into two paragraph, still having the investigative, story telling method
  to keep the audience hooked.
Always magazine-lede style, never starting with "This chapter includes...".

Return ONLY a JSON object, no other text:
{{
  "documentary_title": "punchy overall title",
  "investigation_hook": "two punchy sentences creating curiosity",
  "chapters": [
    {{
      "chapter_number": 1,
      "title": "short evocative chapter title",
      "year_label": "the single most representative year/date for this chapter",
      "tagline": "one witty punchy sentence, never starting with 'This chapter...'",
      "narrative_prose": "80-100 OR 140-160 words per the length rule above, depending on position",
      "event_descriptions": ["exact event text — used only to attach source links"],
      "relevant_narrative_names": ["names of narratives relevant to this chapter"],
      "contradiction_focus": "one sentence if central here, else null",
      "confidence_note": "one sentence on how well-evidenced this chapter is",
      "image_indices": [indices into IMAGES that fit this chapter]
    }}
  ]
}}

EVENTS:
{events_json}

NARRATIVES (with evidence scores):
{narratives_json}

CONTRADICTIONS:
{contradictions_json}

IMAGES (0-indexed):
{images_json}

NEWS ARTICLES:
{news_json}
"""


async def build_story_structure(
    events: list[dict],
    scored_narratives: list[dict],
    contradictions: list[dict],
    images: list[dict] | None = None,
    news_articles: list[dict] | None = None,
) -> dict:
    images = images or []
    news_articles = news_articles or []

    trimmed_events = [
        {"event": e.get("event"), "date": e.get("date"), "consequences": e.get("consequences")}
        for e in events[:60]
    ]
    trimmed_narratives = [
        {
            "name": n.get("narrative_name"),
            "summary": n.get("summary"),
            "stance_balance": n.get("stance_balance"),
            "evidence_strength": n.get("evidence", {}).get("evidence_strength"),
            "confidence_label": n.get("evidence", {}).get("confidence_label"),
        }
        for n in scored_narratives
    ]
    trimmed_contradictions = [
        {
            "narrative_a": c.get("narrative_a"),
            "narrative_b": c.get("narrative_b"),
            "conflict_summary": c.get("conflict_summary"),
            "leaning": c.get("leaning"),
        }
        for c in contradictions
    ]
    trimmed_images = [{"description": (img.get("description") or "")[:150]} for img in images]

    trimmed_news = [
        {
            "headline": a.get("headline"),
            "date": a.get("date"),
        }
        for a in news_articles[:20]
    ]

    prompt = STORY_ARCHITECT_PROMPT.format(
        events_json=json.dumps(trimmed_events, indent=2),
        narratives_json=json.dumps(trimmed_narratives, indent=2),
        contradictions_json=json.dumps(trimmed_contradictions, indent=2),
        images_json=json.dumps(trimmed_images, indent=2),
        news_json=json.dumps(trimmed_news, indent=2),
    )

    result = await call_llm(prompt, default="gemini", json_mode=True, parse_json=True)

    if isinstance(result, list):
        result = {"documentary_title": "", "investigation_hook": "", "chapters": result}

    chapters = result.get("chapters", [])
    events_by_text = {e.get("event"): e for e in events}
    for chapter in chapters:
        chapter["events"] = [
            events_by_text[desc] for desc in chapter.get("event_descriptions", [])
            if desc in events_by_text
        ]
        idxs = chapter.get("image_indices", [])
        chapter["images"] = [images[i] for i in idxs if 0 <= i < len(images)]

    return {
        "documentary_title": result.get("documentary_title", ""),
        "investigation_hook": result.get("investigation_hook", ""),
        "chapters": chapters,
        "news_articles": news_articles,
    }