"""
Narrative Discovery Agent
==========================
Looks across all claims and groups them into recurring NARRATIVES — competing
storylines, not individual facts. E.g. "Paper leak was systemic and organized"
vs "Allegations are exaggerated/false" — each backed by a cluster of claims.

Also runs on Gemini by default for the same reason as Belief Evolution:
this needs to see the whole claim set at once to find clusters.
"""
import json

from app.core.llm_router import call_llm

NARRATIVE_DISCOVERY_PROMPT = """You are a narrative-clustering analyst for an investigative journalism tool.

Below is a list of CLAIMS gathered about a topic. Multiple claims often express
the same underlying STORYLINE from different angles. Your job is to find these
recurring narratives — group of claims that together tell the same "version of
events" — and name each one.

A good topic usually has 2-5 competing or complementary narratives. Don't create
a narrative for every single claim; only group claims that clearly share a
storyline.

Return ONLY a JSON array, no other text. Each item:
{{
  "narrative_name": "short punchy name, e.g. 'Organized Leak Network'",
  "summary": "2-3 sentence summary of this narrative in neutral language",
  "claim_indices": [list of 0-based indices into the CLAIMS array below that support this narrative],
  "stance_balance": "supporting | opposing | mixed — relative to the MAIN CLAIM this narrative makes, not relative to any other narrative or investigation. E.g. if this narrative's main assertion is 'a leak occurred', and the claims agree, stance_balance is 'supporting'. Do NOT flip it based on how controversial the topic is.",
  "strength": "weak | moderate | strong — based on how many claims and how consistent they are"
}}

CLAIMS (0-indexed):
{claims_json}
"""


async def discover_narratives(claims: list[dict]) -> list[dict]:
    if not claims:
        return []

    trimmed = [
        {"claim": c.get("claim"), "stance": c.get("stance")}
        for c in claims[:80]
    ]

    prompt = NARRATIVE_DISCOVERY_PROMPT.format(claims_json=json.dumps(trimmed, indent=2))
    result = await call_llm(prompt, default="gemini", json_mode=True, parse_json=True)

    if isinstance(result, dict):
        result = result.get("narratives", [])

    # Resolve claim_indices back into full claim text so downstream agents
    # (Contradiction, Evidence Verification, Story Architect) don't need to
    # re-look-up the original claims list themselves.
    for n in result:
        indices = n.get("claim_indices", [])
        n["claims"] = [claims[i]["claim"] for i in indices if 0 <= i < len(claims)]

    return result