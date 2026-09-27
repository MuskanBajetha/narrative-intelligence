"""
Belief Evolution Agent
=======================
Takes ALL claims gathered so far (across all sources) and reconstructs how
the dominant public/official belief shifted over time — not just "what
claims exist" but "what did people believe at each point, and how did that
change." This is the agent that turns a claim-list into a timeline.

Runs on Gemini by default: this is a synthesis task over many claims at once
(needs to see the whole set together to notice shifts), which benefits from
a larger context window more than raw speed.
"""
import json

from app.core.llm_router import call_llm

BELIEF_EVOLUTION_PROMPT = """You are a belief-evolution analyst for an investigative journalism tool.

Below is a list of CLAIMS gathered about a topic, each with a date (when the
claim was made/reported) and a stance relative to the main topic.

Your job: reconstruct the TIMELINE OF BELIEF — i.e. at different points in time,
what did the prevailing belief/understanding appear to be, how confident was
that belief, and what changed it. Group claims by rough time period, and for
each period produce ONE dominant-belief snapshot (not a list of every claim).

Return ONLY a JSON array, no other text. Each item:
{{
  "period": "a date or date range, e.g. '2024-05-05' or 'early May 2024'",
  "dominant_belief": "the belief that seemed to prevail in this period, stated as one sentence",
  "confidence": 0-100,
  "supporting_claim_count": number of claims (from the list below) that back this belief in this period,
  "opposing_claim_count": number of claims that contradict it in this period,
  "what_changed": "one sentence: what new evidence/event shifted belief FROM the previous period TO this one, or null if this is the first period"
}}

Order the array chronologically. If there isn't enough date information to
build multiple periods, do your best with what's available and note that in
"what_changed" for period 1 (e.g. "insufficient date granularity").

CLAIMS:
{claims_json}
"""


async def analyze_belief_evolution(claims: list[dict]) -> list[dict]:
    if not claims:
        return []

    # Keep the payload lean: only fields the model needs, and cap count so
    # this stays inside free-tier token budgets on a big topic.
    trimmed = [
        {"claim": c.get("claim"), "date": c.get("date"), "stance": c.get("stance")}
        for c in claims[:80]
    ]

    prompt = BELIEF_EVOLUTION_PROMPT.format(claims_json=json.dumps(trimmed, indent=2))
    result = await call_llm(prompt, default="gemini", json_mode=True, parse_json=True)

    if isinstance(result, dict):
        result = result.get("timeline", result.get("periods", []))
    return result