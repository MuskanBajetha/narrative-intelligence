"""
Contradiction Agent
=====================
Looks across narratives (produced by Narrative Discovery) and identifies
direct contradictions between them — places where two narratives can't both
be true. Does NOT decide who's right. Instead it surfaces the conflict and
flags whether more evidence is needed before Evidence Verification can score
things confidently.

This agent is also where the "loop back to Discovery" signal originates —
in Phase 5 (orchestration), if needs_more_evidence is True, the graph will
route back to the Discovery Agent with a targeted follow-up query.
"""
import json

from app.core.llm_router import call_llm

CONTRADICTION_PROMPT = """You are a contradiction-detection analyst for an investigative journalism tool.

Below is a list of NARRATIVES discovered about a topic. Each narrative is a
cluster of claims telling one version of events. Some narratives directly
contradict each other; some are compatible or address different aspects
of the topic entirely.

Your job: identify pairs of narratives that DIRECTLY CONTRADICT each other
(i.e. if one is true, the other cannot be), and for each contradiction assess
whether the current evidence is strong enough to lean toward one side, or
whether more evidence is needed.

Return ONLY a JSON array, no other text. Each item:
{{
  "narrative_a": "name of first narrative",
  "narrative_b": "name of second narrative",
  "conflict_summary": "one sentence describing exactly what they disagree about",
  "resolvable_with_current_evidence": true or false,
  "leaning": "narrative_a | narrative_b | unresolved — which way current evidence leans, if any",
  "needs_more_evidence": true or false,
  "suggested_followup_query": "a specific search query that would help resolve this, or null if not needed"
}}

If no narratives directly contradict each other, return an empty array [].

NARRATIVES:
{narratives_json}
"""


async def find_contradictions(narratives: list[dict]) -> list[dict]:
    if len(narratives) < 2:
        return []

    trimmed = [
        {"name": n.get("narrative_name"), "summary": n.get("summary"), "stance_balance": n.get("stance_balance")}
        for n in narratives
    ]

    prompt = CONTRADICTION_PROMPT.format(narratives_json=json.dumps(trimmed, indent=2))
    result = await call_llm(prompt, default="gemini", json_mode=True, parse_json=True)

    if isinstance(result, dict):
        result = result.get("contradictions", [])
    return result