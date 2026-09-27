"""
Investigation Graph
=====================
Wires the agents into a LangGraph StateGraph with real looping:

  discovery -> extraction -> narrative_discovery -> contradiction
       ^                                                  |
       |__________ (if needs_more_evidence) _____________|

Contradiction decides whether to loop back (more evidence needed, under
loop cap) or proceed to evidence_verification and finish.

Extraction and downstream analysis nodes are fault-tolerant:
a failure for one document or one analysis step should not crash the
entire investigation.
"""
import logging
import asyncio 

from langgraph.graph import StateGraph, END

from app.core.state import InvestigationState
from app.agents.discovery import discover, SourceDoc
from app.agents.event_extraction import extract_events
from app.agents.claim_extraction import extract_claims
from app.agents.narrative_discovery import discover_narratives
from app.agents.contradiction import find_contradictions
from app.agents.evidence_verification import score_all_narratives
from app.agents.story_architect import build_story_structure

logger = logging.getLogger("investigation_graph")


# ── Nodes ─────────────────────────────────────────────────────────────

async def node_discovery(state: InvestigationState) -> dict:
    from app.agents.relevance_filter import filter_relevant_docs
    from app.agents.discovery import get_last_images

    query = state.get("pending_query") or state["topic"]
    logger.info("Discovery: searching %r", query)

    docs = discover(query, max_results=3)
    doc_dicts = [d.__dict__ for d in docs]

    relevant_docs = await filter_relevant_docs(state["topic"], doc_dicts)
    new_images = get_last_images()

    existing = state.get("docs", [])
    existing_images = state.get("images", [])

    return {
        "docs": existing + relevant_docs,
        "images": existing_images + new_images,
        "pending_query": None,
    }


async def node_extraction(state: InvestigationState) -> dict:
    """
    Only extracts from docs we haven't processed yet — tracked by comparing
    against events/claims already gathered, using source_url as the key.

    Event and claim extraction are isolated from each other so a failure in
    one provider/extractor does not prevent the other extraction from being
    attempted for the same document.
    """
    already_processed = {e.get("source_url") for e in state.get("events", [])}
    new_docs = [d for d in state["docs"] if d["url"] not in already_processed]
    logger.info("Extraction: processing %d new docs", len(new_docs))

    sem = asyncio.Semaphore(3)  # tune to roughly (number of keys) across providers

    async def process_doc(doc):
        async def safe_events():
            try:
                return await extract_events(doc["content"], doc["url"])
            except Exception as e:
                logger.warning("Event extraction failed for %s: %s", doc["url"], e)
                return []
        async def safe_claims():
            try:
                return await extract_claims(doc["content"], doc["url"])
            except Exception as e:
                logger.warning("Claim extraction failed for %s: %s", doc["url"], e)
                return []
        async with sem:
            ev, cl = await asyncio.gather(safe_events(), safe_claims())
            return ev, cl

    results = await asyncio.gather(*[process_doc(d) for d in new_docs])

    events, claims = list(state.get("events", [])), list(state.get("claims", []))
    for ev, cl in results:
        events.extend(ev)
        claims.extend(cl)

    return {"events": events, "claims": claims}


async def node_narrative_discovery(state: InvestigationState) -> dict:
    """
    Discover narratives from the claims collected so far.

    If narrative discovery fails completely, return an empty list rather
    than crashing the investigation graph.
    """
    claims = state.get("claims", [])

    logger.info(
        "Narrative Discovery: clustering %d claims",
        len(claims),
    )

    try:
        narratives = await discover_narratives(claims)
    except Exception as e:
        logger.warning(
            "Narrative discovery failed, continuing with no narratives: %s",
            e,
        )
        narratives = []

    return {
        "narratives": narratives,
    }


async def node_news_enrichment(state: InvestigationState) -> dict:
    from app.agents.news_enrichment import fetch_news_articles

    logger.info("News Enrichment: fetching related coverage")
    articles = await fetch_news_articles(state["topic"])

    return {
        "news_articles": articles,
    }


async def node_contradiction(state: InvestigationState) -> dict:
    """
    Check narratives for contradictions.

    If contradiction detection fails, continue with an empty contradiction
    list and mark the investigation as done for this pass rather than
    propagating the provider failure through the graph.
    """
    narratives = state.get("narratives", [])

    logger.info(
        "Contradiction: checking %d narratives",
        len(narratives),
    )

    try:
        contradictions = await find_contradictions(narratives)
    except Exception as e:
        logger.warning(
            "Contradiction detection failed, continuing with no "
            "contradictions: %s",
            e,
        )
        contradictions = []

    loop_count = state.get("loop_count", 0)
    max_loops = state.get("max_loops", 2)

    needs_more = any(
        c.get("needs_more_evidence")
        for c in contradictions
    )

    followup = next(
        (
            c.get("suggested_followup_query")
            for c in contradictions
            if c.get("needs_more_evidence")
        ),
        None,
    )

    if needs_more and loop_count < max_loops and followup:
        logger.info(
            "Contradiction unresolved, looping back to Discovery "
            "(loop %d/%d)",
            loop_count + 1,
            max_loops,
        )

        return {
            "contradictions": contradictions,
            "loop_count": loop_count + 1,
            "pending_query": followup,
            "done": False,
        }

    return {
        "contradictions": contradictions,
        "done": True,
    }


async def node_evidence_verification(state: InvestigationState) -> dict:
    """
    Score all narratives against the detected contradictions.

    If verification fails, return an empty scored_narratives list so the
    story architect can still run and the graph can finish gracefully.
    """
    narratives = state.get("narratives", [])
    contradictions = state.get("contradictions", [])

    logger.info(
        "Evidence Verification: scoring %d narratives",
        len(narratives),
    )

    try:
        scored = await score_all_narratives(
            narratives,
            contradictions,
        )
    except Exception as e:
        logger.warning(
            "Evidence verification failed, continuing with no "
            "scored narratives: %s",
            e,
        )
        scored = []

    return {
        "scored_narratives": scored,
    }


async def node_story_architect(state: InvestigationState) -> dict:
    """
    Build the final documentary/story structure.

    Story architecture is the final processing step, so a failure here
    should still return a valid best-effort result instead of crashing
    the investigation.
    """
    logger.info("Story Architect: building chapter structure")

    try:
        result = await build_story_structure(
            state.get("events", []),
            state.get("scored_narratives", []),
            state.get("contradictions", []),
            state.get("images", []),
        )

        return {
            "chapters": result.get("chapters", []),
            "documentary_title": result.get(
                "documentary_title",
                "",
            ),
            "investigation_hook": result.get(
                "investigation_hook",
                "",
            ),
        }

    except Exception as e:
        logger.warning(
            "Story architecture failed, returning best-effort empty "
            "story structure: %s",
            e,
        )

        return {
            "chapters": [],
            "documentary_title": "",
            "investigation_hook": "",
        }


# ── Routing ───────────────────────────────────────────────────────────

def route_after_contradiction(state: InvestigationState) -> str:
    return (
        "discovery"
        if not state.get("done")
        else "evidence_verification"
    )


# ── Build the graph ──────────────────────────────────────────────────

def build_investigation_graph():
    graph = StateGraph(InvestigationState)

    graph.add_node("discovery", node_discovery)
    graph.add_node("extraction", node_extraction)
    graph.add_node("narrative_discovery", node_narrative_discovery)
    graph.add_node("contradiction", node_contradiction)
    graph.add_node("evidence_verification", node_evidence_verification)
    graph.add_node("news_enrichment", node_news_enrichment)
    graph.add_node("story_architect", node_story_architect)

    graph.set_entry_point("discovery")

    graph.add_edge("discovery", "extraction")
    graph.add_edge("extraction", "narrative_discovery")
    graph.add_edge("narrative_discovery", "contradiction")

    graph.add_conditional_edges(
        "contradiction",
        route_after_contradiction,
        {
            "discovery": "discovery",
            "evidence_verification": "evidence_verification",
        },
    )

    graph.add_edge(
        "evidence_verification",
        "news_enrichment",
    )
    graph.add_edge(
        "news_enrichment",
        "story_architect",
    )
    graph.add_edge(
        "story_architect",
        END,
    )

    return graph.compile()
