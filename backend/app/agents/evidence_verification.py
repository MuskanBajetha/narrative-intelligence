"""
Evidence Verification Agent
=============================
Scores each narrative's EVIDENCE STRENGTH — not truth, just how well-supported
it currently is given number of sources, source diversity, recency, and
whether it survived contradiction-checking. This score is what the Story
Architect and frontend confidence-meter will display.

Important: this agent should be skeptical by design. A narrative backed by
one source repeated three ways is NOT the same as three independent sources.
"""
import json

from app.core.llm_router import call_llm

EVIDENCE_VERIFICATION_PROMPT = """You are an evidence-verification analyst for an investigative journalism tool.
You are deliberately skeptical: your job is to score evidence STRENGTH, not
to decide what is true.

For the narrative below, you're given:
- its claims
- how many distinct source URLs those claims came from
- any contradictions this narrative was involved in (if resolved against it)

Score it using these factors:
- source_count: how many claims support it
- source_diversity: how many distinct URLs/domains those claims came from (more = stronger)
- contradicted: whether this narrative lost a contradiction to another narrative
- corroboration: do independent-looking claims reinforce each other, or is it one claim repeated?

Return ONLY a JSON object, no other text:
{{
  "evidence_strength": 0-100,
  "reasoning": "2-3 sentences explaining the score, mentioning specific factors above",
  "confidence_label": "low | moderate | high"
}}

NARRATIVE NAME: {name}
SUMMARY: {summary}
CLAIMS SUPPORTING IT: {claims_json}
DISTINCT SOURCE COUNT: {source_count}
CONTRADICTED BY ANOTHER NARRATIVE: {contradicted}
"""


async def score_narrative_evidence(
    narrative: dict,
    source_count: int,
    contradicted: bool = False,
) -> dict:
    prompt = EVIDENCE_VERIFICATION_PROMPT.format(
        name=narrative.get("narrative_name"),
        summary=narrative.get("summary"),
        claims_json=json.dumps(narrative.get("claims", [])[:20]),
        source_count=source_count,
        contradicted=contradicted,
    )
    result = await call_llm(prompt, default="groq", json_mode=True, parse_json=True)
    return result


async def score_all_narratives(narratives: list[dict], contradictions: list[dict]) -> list[dict]:
    """
    Runs evidence scoring for every narrative, factoring in whether it lost
    any contradiction found by the Contradiction Agent.
    """
    contradicted_names = {
        c["narrative_a"] if c.get("leaning") == "narrative_b" else c["narrative_b"]
        for c in contradictions
        if c.get("leaning") in ("narrative_a", "narrative_b")
    }

    scored = []
    for n in narratives:
        # crude source_count proxy: number of unique claim strings (real source
        # URLs get wired in properly once claims carry source_url through to here)
        source_count = len(set(n.get("claims", [])))
        was_contradicted = n.get("narrative_name") in contradicted_names

        score = await score_narrative_evidence(n, source_count, was_contradicted)
        scored.append({**n, "evidence": score})

    return scored