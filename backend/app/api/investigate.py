import json
import logging

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.graph import build_investigation_graph
from app.db.session import get_db
from app.db.repository import (
    get_all_topics,
    get_cached_investigation_by_topic,
    save_investigation,
    get_or_create_user,
    record_user_search,
    get_user_dashboard,
)
from app.agents.topic_dedup import find_matching_topic

logger = logging.getLogger("investigate_api")
router = APIRouter()

NODE_LABELS = {
    "discovery": "Searching for sources…",
    "extraction": "Extracting events and claims…",
    "narrative_discovery": "Clustering claims into narratives…",
    "contradiction": "Checking for contradictions…",
    "evidence_verification": "Scoring evidence strength…",
    "news_enrichment": "Gathering related coverage…",
    "story_architect": "Building chapter structure…",
}


class InvestigateRequest(BaseModel):
    topic: str
    max_loops: int = 2
    force_refresh: bool = False
    google_id: str | None = None
    email: str | None = None
    name: str | None = None


def sse_event(event_type: str, data: dict) -> str:
    return f"event: {event_type}\ndata: {json.dumps(data, default=str)}\n\n"


@router.post("/api/investigate/stream")
async def investigate_stream(req: InvestigateRequest, db: Session = Depends(get_db)):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="topic cannot be empty")

    async def event_generator():
        user = None
        if req.google_id:
            user = get_or_create_user(db, req.google_id, req.email or "", req.name or "")

        if not req.force_refresh:
            # 1. Exact-match cache check (fast, no LLM call)
            cached = get_cached_investigation_by_topic(db, req.topic)

            # 2. If no exact match, ask the dedup agent whether this is the
            # same story as something already stored under different wording.
            if not cached:
                existing_topics = get_all_topics(db)
                matched_topic = await find_matching_topic(req.topic, existing_topics)
                if matched_topic:
                    cached = get_cached_investigation_by_topic(db, matched_topic)

            if cached:
                if user:
                    record_user_search(db, user.id, cached.id)
                yield sse_event("progress", {"message": "Found existing story", "node": "cache"})
                yield sse_event("done", cached.result)
                return

        graph = build_investigation_graph()
        initial_state = {
            "topic": req.topic,
            "docs": [], "events": [], "claims": [],
            "loop_count": 0, "max_loops": req.max_loops,
            "pending_query": None, "done": False,
        }

        final_state = None
        try:
            async for event in graph.astream(initial_state, stream_mode="updates"):
                for node_name, node_output in event.items():
                    label = NODE_LABELS.get(node_name, f"Running {node_name}…")
                    yield sse_event("progress", {"message": label, "node": node_name})
                    final_state = {**(final_state or {}), **node_output}
        except Exception as e:
            logger.exception("Investigation stream failed")
            yield sse_event("error", {"message": str(e)})
            return

        if final_state:
            merged = {**initial_state, **final_state}
            row = save_investigation(db, req.topic, merged)
            if user:
                record_user_search(db, user.id, row.id)
            yield sse_event("done", merged)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/api/investigate/{topic}")
def get_investigation(topic: str, db: Session = Depends(get_db)):
    cached = get_cached_investigation_by_topic(db, topic)
    if not cached:
        raise HTTPException(status_code=404, detail="No cached investigation for this topic")
    return cached.result


@router.get("/api/dashboard/{google_id}")
def dashboard(google_id: str, db: Session = Depends(get_db)):
    from app.db.models import User
    user_row = db.query(User).filter(User.google_id == google_id).first()
    if not user_row:
        return []
    return get_user_dashboard(db, user_row.id)