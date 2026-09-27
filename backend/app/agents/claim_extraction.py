"""
Claim Extraction Agent
=======================
Unlike events (what happened), claims are ASSERTIONS — statements someone
made that could be true, false, or disputed. This is what later feeds the
Belief Evolution and Contradiction agents.
"""
from app.core.llm_router import call_llm

CLAIM_EXTRACTION_PROMPT = """You are a claim extraction system for an investigative journalism tool.

Read the source text below and extract every distinct CLAIM — an assertion
that something is/was true, which could be disputed or later confirmed/denied.
Do NOT extract claims that are just factual events already obviously established
(e.g. "the meeting happened on Monday") — focus on assertions of belief, cause,
blame, prediction, or disputed fact.

Return ONLY a JSON array, no other text. Each item:
{{
  "claim": "the assertion, in neutral restated form",
  "claimant": "who made this claim, or 'unspecified' if not attributed",
  "date": "date the claim was made, or null if unknown",
  "stance": "supporting | opposing | neutral — relative to the main topic",
  "confidence_hint": "how strongly the source presents this claim: low | medium | high"
}}

If the text contains no clear claims, return an empty array [].

SOURCE TEXT:
\"\"\"
{text}
\"\"\"
"""


async def extract_claims(text: str, source_url: str = "") -> list[dict]:
    prompt = CLAIM_EXTRACTION_PROMPT.format(text=text[:6000])
    result = await call_llm(prompt, default="gemini", json_mode=True, parse_json=True)
    if isinstance(result, dict):
        result = result.get("claims", [])
    for c in result:
        c["source_url"] = source_url
    return result