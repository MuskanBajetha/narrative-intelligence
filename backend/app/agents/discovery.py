"""
Discovery Agent
================
Given a topic/sub-question, finds source material. Tries Tavily first
(built for LLM agents — returns clean summarized snippets), falls back
to Wikipedia if Tavily fails or hits its rate limit.
"""
import logging
from dataclasses import dataclass, field

import httpx
from tavily import TavilyClient

from app.core.config import settings

logger = logging.getLogger("discovery_agent")


@dataclass
class SourceDoc:
    title: str
    url: str
    content: str
    source_type: str  # "tavily" | "wikipedia"
    published_date: str | None = None


def search_tavily(query: str, max_results: int = 5) -> list[SourceDoc]:
    client = TavilyClient(api_key=settings.tavily_api_key)
    resp = client.search(
        query=query,
        max_results=max_results,
        search_depth="advanced",
        include_images=True,          # ← new: pulls real image URLs tied to results
        include_image_descriptions=True,
    )
    docs = []
    for r in resp.get("results", []):
        docs.append(SourceDoc(
            title=r.get("title", ""),
            url=r.get("url", ""),
            content=r.get("content", ""),
            source_type="tavily",
            published_date=r.get("published_date"),
        ))
    # Stash images on the module-level list so the graph node can pick them up.
    # (Simple approach for now — a proper version would attach per-doc.)
    global _last_images
    _last_images = [
        {"url": img.get("url"), "description": img.get("description", "")}
        for img in resp.get("images", [])
        if img.get("url")
    ][:6]
    return docs


_last_images: list[dict] = []


def get_last_images() -> list[dict]:
    return _last_images


def search_wikipedia(query: str, max_results: int = 3) -> list[SourceDoc]:
    # Wikipedia's REST search API — free, no key needed
    resp = httpx.get(
        "https://en.wikipedia.org/w/rest.php/v1/search/page",
        params={"q": query, "limit": max_results},
        timeout=10,
    )
    resp.raise_for_status()
    docs = []
    for r in resp.json().get("pages", []):
        title = r["title"]
        extract = r.get("excerpt", "").replace("<span class=\"searchmatch\">", "").replace("</span>", "")
        docs.append(SourceDoc(
            title=title,
            url=f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
            content=extract,
            source_type="wikipedia",
        ))
    return docs


def discover(query: str, max_results: int = 5) -> list[SourceDoc]:
    """Try Tavily first, fall back to Wikipedia on any failure."""
    try:
        docs = search_tavily(query, max_results)
        if docs:
            return docs
        logger.warning("Tavily returned 0 results for %r, falling back to Wikipedia", query)
    except Exception as e:
        logger.warning("Tavily failed (%s), falling back to Wikipedia", e)

    return search_wikipedia(query, max_results)