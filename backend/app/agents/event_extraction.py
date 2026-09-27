"""
Event Extraction Agent
=======================
Reads raw source text and pulls out structured events: what happened,
when, who was involved, where, and what the consequences were.
"""
from app.core.llm_router import call_llm

EVENT_EXTRACTION_PROMPT = """You are an event extraction system for an investigative journalism tool.

Read the source text below and extract every distinct EVENT mentioned — a concrete
thing that happened at a specific (even approximate) point in time.

Return ONLY a JSON array, no other text. Each item:
{{
  "event": "short description of what happened",
  "date": "date or approximate date, or null if unknown",
  "participants": ["names of people/organizations involved"],
  "location": "location if mentioned, or null",
  "consequences": "what resulted from this event, or null if not stated"
}}

If the text contains no clear events, return an empty array [].

SOURCE TEXT:
\"\"\"
{text}
\"\"\"
"""


async def extract_events(text: str, source_url: str = "") -> list[dict]:
    prompt = EVENT_EXTRACTION_PROMPT.format(text=text[:6000])  # keep prompts small for free-tier limits
    result = await call_llm(prompt, default="groq", json_mode=True, parse_json=True)
    if isinstance(result, dict):
        # some models wrap arrays in {"events": [...]} despite instructions — handle gracefully
        result = result.get("events", [])
    for e in result:
        e["source_url"] = source_url
    return result