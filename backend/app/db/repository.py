"""
Thin data-access layer so API/agent code never touches SQLAlchemy directly.
"""
from sqlalchemy.orm import Session

from app.db.models import Investigation, User, UserInvestigation, normalize_topic


def get_all_topics(db: Session) -> list[str]:
    return [row.topic for row in db.query(Investigation.topic).all()]


def get_cached_investigation_by_topic(db: Session, topic: str) -> Investigation | None:
    key = normalize_topic(topic)
    return db.query(Investigation).filter(Investigation.topic_normalized == key).first()


def save_investigation(db: Session, topic: str, result: dict) -> Investigation:
    key = normalize_topic(topic)
    existing = db.query(Investigation).filter(Investigation.topic_normalized == key).first()
    if existing:
        existing.result = result
        db.commit()
        return existing
    row = Investigation(topic=topic, topic_normalized=key, result=result)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_or_create_user(db: Session, google_id: str | None, email: str, name: str) -> User:
    # Look up by email FIRST — email is the durable identity across both
    # auth methods (Google and password), whereas google_id only applies to
    # one of them and credentials-login sends a synthetic non-Google id here.
    user = None
    if email:
        user = db.query(User).filter(User.email == email).first()
    if not user and google_id:
        user = db.query(User).filter(User.google_id == google_id).first()

    if user:
        # Backfill google_id if this login came from Google and the existing
        # row (e.g. from a password signup) doesn't have one yet.
        if google_id and not user.google_id:
            user.google_id = google_id
            db.commit()
        return user

    user = User(google_id=google_id, email=email, name=name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def record_user_search(db: Session, user_id: int, investigation_id: int) -> None:
    exists = (
        db.query(UserInvestigation)
        .filter_by(user_id=user_id, investigation_id=investigation_id)
        .first()
    )
    if not exists:
        db.add(UserInvestigation(user_id=user_id, investigation_id=investigation_id))
        db.commit()


def get_user_dashboard(db: Session, user_id: int) -> list[dict]:
    rows = (
        db.query(UserInvestigation)
        .filter_by(user_id=user_id)
        .order_by(UserInvestigation.searched_at.desc())
        .all()
    )

    entries = []
    for r in rows:
        result = r.investigation.result or {}
        chapters = result.get("chapters", [])
        scored = result.get("scored_narratives", [])

        # cover image: first available image across all chapters
        cover_image = None
        for ch in chapters:
            imgs = ch.get("images") or []
            if imgs:
                cover_image = imgs[0].get("url")
                break

        # rough reading time: ~200 words/min across all narrative_prose
        total_words = sum(len((ch.get("narrative_prose") or "").split()) for ch in chapters)
        reading_minutes = max(1, round(total_words / 200))

        # average evidence strength across narratives
        strengths = [n.get("evidence", {}).get("evidence_strength", 0) for n in scored if n.get("evidence")]
        avg_evidence = round(sum(strengths) / len(strengths)) if strengths else None

        # rough source count: unique source_urls across all chapter events
        source_urls = set()
        for ch in chapters:
            for e in ch.get("events", []):
                if e.get("source_url"):
                    source_urls.add(e["source_url"])

        entries.append({
            "topic": r.investigation.topic,
            "searched_at": r.searched_at.isoformat(),
            "documentary_title": result.get("documentary_title", ""),
            "cover_image": cover_image,
            "reading_minutes": reading_minutes,
            "evidence_score": avg_evidence,
            "source_count": len(source_urls),
            "chapter_count": len(chapters),
            "year_labels": [ch.get("year_label") for ch in chapters if ch.get("year_label")],
        })
    return entries