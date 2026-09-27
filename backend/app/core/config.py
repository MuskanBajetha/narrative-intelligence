"""
Centralized app configuration.

Everything reads from environment variables (loaded from .env in dev).
This is the ONLY place that should call os.getenv / read the .env file directly —
every other module should import `settings` from here.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM providers
    #
    # Keep the singular keys for backward compatibility.
    # The *_api_keys fields accept comma-separated keys for rotation.
    groq_api_key: str = ""
    gemini_api_key: str = ""

    groq_api_keys: str = ""
    gemini_api_keys: str = ""

    groq_model: str = "qwen/qwen3.8-27b"
    gemini_model: str = "gemini-3.8-flash"

    # Search
    tavily_api_key: str = ""

    # Database
    database_url: str = (
        "postgresql://postgres:password@localhost:5432/narrative_engine"
    )

    # App
    env: str = "development"
    log_level: str = "INFO"

    guardian_api_key: str = ""

    @property
    def groq_keys(self) -> list[str]:
        """Return configured Groq API keys as a cleaned list."""
        return [
            key.strip()
            for key in self.groq_api_keys.split(",")
            if key.strip()
        ]

    @property
    def gemini_keys(self) -> list[str]:
        """Return configured Gemini API keys as a cleaned list."""
        return [
            key.strip()
            for key in self.gemini_api_keys.split(",")
            if key.strip()
        ]

    @property
    def is_dev(self) -> bool:
        return self.env.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """Cached so we don't re-parse env vars on every import."""
    return Settings()


settings = get_settings()
