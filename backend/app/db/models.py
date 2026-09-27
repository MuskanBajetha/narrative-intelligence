"""
SQLAlchemy models.

- Investigation rows are now GLOBAL (shared cache across all users) — if
  anyone has already investigated a topic, everyone gets the cached result.
  This matches "won't be searched again even by a different user."
- User rows track who's logged in (via Google OAuth, handled by NextAuth on
  the frontend — this table just mirrors the user identity for the dashboard
  join table below).
- UserInvestigation is a join table: which investigations a given user has
  personally looked up, so their dashboard can list "stories you've searched"
  without duplicating the underlying investigation data.
"""
import datetime

from sqlalchemy import String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    topic: Mapped[str] = mapped_column(String(500))
    topic_normalized: Mapped[str] = mapped_column(String(500), index=True, unique=True)
    result: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    google_id: Mapped[str | None] = mapped_column(String(255), unique=True, index=True, nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class UserInvestigation(Base):
    __tablename__ = "user_investigations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    investigation_id: Mapped[int] = mapped_column(ForeignKey("investigations.id"), index=True)
    searched_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, default=datetime.datetime.utcnow
    )

    user = relationship("User")
    investigation = relationship("Investigation")


def normalize_topic(topic: str) -> str:
    return " ".join(topic.strip().lower().split())