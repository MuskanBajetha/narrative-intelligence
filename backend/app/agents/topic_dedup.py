"""
Topic Deduplication Agent
===========================
Before running a full investigation (which costs many LLM calls and takes
minutes), check whether the new topic is semantically the same story as one
already investigated — even if worded differently ("NEET paper leak" vs
"neet leak 2024" vs "NEET Leak"). One cheap Groq call against the list of
existing topics, rather than a vector DB — fine at moderate scale; revisit
with embeddings if the topic list grows into the thousands.
"""
import json

from app.core.llm_router import call_llm

DEDUP_PROMPT = """You are a topic-matching assistant. A user wants to investigate:

NEW TOPIC: "{new_topic}"

Here are topics that have ALREADY been investigated:
{existing_topics_json}

Does the NEW TOPIC refer to the SAME real-world story/incident as any topic
in that list — even if worded differently, abbreviated, or missing a year?
Only match if it's genuinely the same underlying event, not just a related
or similar-category topic.

Return ONLY a JSON object, no other text:
{{
  "matches_existing": true or false,
  "matched_topic": "the exact existing topic string it matches, or null"
}}
"""


async def find_matching_topic(new_topic: str, existing_topics: list[str]) -> str | None:
    if not existing_topics:
        return None

    prompt = DEDUP_PROMPT.format(
        new_topic=new_topic,
        existing_topics_json=json.dumps(existing_topics[:100], indent=2),
    )
    result = await call_llm(prompt, default="groq", json_mode=True, parse_json=True)

    if result.get("matches_existing") and result.get("matched_topic"):
        return result["matched_topic"]
    return None