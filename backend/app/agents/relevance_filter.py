"""
Relevance Filter
==================
Runs right after Discovery. Free-tier search results often return
adjacent-but-different stories (different year, different country, same
general topic) — e.g. searching "NEET paper leak 2024" can return the 2026
NEET controversy or unrelated exam-leak stories from other countries.

This agent checks each discovered doc against the ORIGINAL investigation
topic and drops anything that isn't actually about the same specific
incident. Cheap, fast, runs on Groq — one short call per doc.
"""
from app.core.llm_router import call_llm

RELEVANCE_PROMPT = """You are a relevance-filtering step for an investigative research tool.

INVESTIGATION TOPIC: "{topic}"

SOURCE DOCUMENT:
Title: {title}
Content excerpt: {content}

Is this document about the SAME specific incident as the investigation topic —
same event, same year/timeframe, same country if relevant — not just a
generally similar or adjacent story (e.g. a different year's leak, a leak in
a different country, or a broader trend piece that isn't about this specific
incident)?

Return ONLY a JSON object, no other text:
{{
  "relevant": true or false,
  "reason": "one sentence explaining why"
}}
"""


async def is_relevant(topic: str, title: str, content: str) -> dict:
    prompt = RELEVANCE_PROMPT.format(topic=topic, title=title, content=content[:1500])
    result = await call_llm(prompt, default="groq", json_mode=True, parse_json=True)
    return result


async def filter_relevant_docs(topic: str, docs: list[dict]) -> list[dict]:
    """Returns only docs judged relevant to the specific investigation topic."""
    kept = []
    for doc in docs:
        verdict = await is_relevant(topic, doc.get("title", ""), doc.get("content", ""))
        if verdict.get("relevant"):
            kept.append(doc)
        else:
            # Keep this print in for now — useful while tuning the filter
            print(f"  [filtered out] {doc.get('title')} — {verdict.get('reason')}")
    return kept