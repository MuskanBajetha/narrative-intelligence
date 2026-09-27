"""
Database engine + session setup. Uses your local Postgres (or Supabase/Neon
later — just swap DATABASE_URL, nothing else changes).
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.db.models import Base

engine = create_engine(settings.database_url, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db():
    """Creates tables if they don't exist. Call once on app startup.
    (Fine for now — swap for Alembic migrations before this matters in prod.)"""
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()