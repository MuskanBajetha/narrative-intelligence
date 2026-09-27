"""
Shared state schema for the LangGraph investigation pipeline.

LangGraph passes this dict between every node. Each node reads what it
needs and returns a partial update (LangGraph merges it in) — nodes never
need the full state, just the fields they care about.
"""
from typing import TypedDict


class InvestigationState(TypedDict, total=False):
    topic: str
    docs: list[dict]              # raw SourceDoc-as-dict from Discovery
    events: list[dict]
    claims: list[dict]
    narratives: list[dict]
    contradictions: list[dict]
    scored_narratives: list[dict]
    chapters: list[dict] 
    documentary_title: str
    investigation_hook: str 
    images: list[dict]
    news_articles: list[dict]       

    loop_count: int                # how many times we've gone back to Discovery
    max_loops: int                 # safety cap
    pending_query: str | None      # follow-up query to run next, if any
    done: bool