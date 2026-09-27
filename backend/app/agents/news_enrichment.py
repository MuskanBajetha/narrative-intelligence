"""
News Enrichment Agent
=======================
Pulls related news coverage for the investigation topic from The Guardian's
Open Platform (free tier, generous rate limits, simple API key at
https://open-platform.theguardian.com/access/). Used for the Evidence Board's
"newspaper headline strip" — separate from Discovery's Tavily results, since
this gives properly structured headline/publication/date metadata rather than
scraped page content.

For genuinely historical topics, the same endpoint's date filters can reach
back to the Guardian's archive (from 1999 onward) — good enough for "older
articles" without needing a separate Chronicling America / OCR pipeline.
"""
import httpx

from app.core.config import settings


async def fetch_news_articles(topic: str, max_results: int = 6) -> list[dict]:
    if not settings.guardian_api_key:
        return []

    query = f'"{topic}"' if len(topic.split()) > 1 else topic

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://content.guardianapis.com/search",
                params={
                    "q": query,
                    "api-key": settings.guardian_api_key,
                    "page-size": max_results,
                    "show-fields": "trailText",
                    "order-by": "relevance",
                },
            )
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []
    # ...rest unchanged

    results = []
    for item in data.get("response", {}).get("results", []):
        fields = item.get("fields", {})
        results.append({
            "headline": item.get("webTitle", ""),
            "snippet": fields.get("trailText", ""),
            "publication": "The Guardian",
            "date": item.get("webPublicationDate", ""),
            "url": item.get("webUrl", ""),
        })
    return results