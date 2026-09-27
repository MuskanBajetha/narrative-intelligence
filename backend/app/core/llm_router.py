import asyncio
import itertools
import json
import logging
from typing import Literal

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)

from app.core.config import settings

logger = logging.getLogger("llm_router")

Provider = Literal["groq", "gemini"]


class LLMError(Exception):
    """Raised when both primary and fallback provider fail."""


class RateLimitError(Exception):
    """Raised internally to trigger retry/fallback logic."""


# ── Provider-specific concurrency limits ────────────────────────────────
#
# Free-tier Groq/Gemini have tight rate limits. Serializing calls per
# provider prevents a batch of extraction tasks from hitting the same
# provider simultaneously and triggering a burst of 429s.
_groq_semaphore = asyncio.Semaphore(2)
_gemini_semaphore = asyncio.Semaphore(2)

_SEMAPHORES = {
    "groq": _groq_semaphore,
    "gemini": _gemini_semaphore,
}


# ── Provider-specific API key rotation ──────────────────────────────────
#
# Each provider gets its own round-robin key cycle.
#
# Example:
#   GROQ_API_KEYS=key1,key2,key3
#
# Calls will use:
#   key1 -> key2 -> key3 -> key1 -> ...
#
# If no multi-key configuration exists, the existing singular
# GROQ_API_KEY / GEMINI_API_KEY value is used instead.

_groq_key_cycle = None
_gemini_key_cycle = None


def _next_key(provider: Provider) -> str:
    """
    Return the next API key for the requested provider using round-robin
    rotation.

    Falls back to the existing singular API key when no key list is
    configured.
    """
    global _groq_key_cycle, _gemini_key_cycle

    if provider == "groq":
        if _groq_key_cycle is None:
            keys = settings.groq_keys or [settings.groq_api_key]

            if not keys or not keys[0]:
                raise LLMError("No Groq API key configured")

            _groq_key_cycle = itertools.cycle(keys)

        return next(_groq_key_cycle)

    else:
        if _gemini_key_cycle is None:
            keys = settings.gemini_keys or [settings.gemini_api_key]

            if not keys or not keys[0]:
                raise LLMError("No Gemini API key configured")

            _gemini_key_cycle = itertools.cycle(keys)

        return next(_gemini_key_cycle)


# ── Provider-specific call implementations ──────────────────────────────

async def _call_groq(prompt: str, system: str | None, json_mode: bool) -> str:
    from groq import AsyncGroq, RateLimitError as GroqRateLimitError
    client = AsyncGroq(api_key=_next_key("groq"))

    messages = []

    if system:
        messages.append(
            {
                "role": "system",
                "content": system,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": prompt,
        }
    )

    kwargs = {}

    if json_mode:
        kwargs["response_format"] = {
            "type": "json_object",
        }

    try:
        resp = await client.chat.completions.create(
            model=settings.groq_model,
            messages=messages,
            temperature=0.3,
            **kwargs,
        )

        return resp.choices[0].message.content

    except GroqRateLimitError as e:
        raise RateLimitError(str(e)) from e


async def _call_gemini(prompt: str, system: str | None, json_mode: bool) -> str:
    import google.generativeai as genai
    genai.configure(api_key=_next_key("gemini"))

    generation_config = {
        "temperature": 0.3,
    }

    if json_mode:
        generation_config["response_mime_type"] = "application/json"

    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=system,
        generation_config=generation_config,
    )

    try:
        resp = await model.generate_content_async(prompt)
        return resp.text

    except Exception as e:
        # google-generativeai doesn't expose a clean RateLimitError type;
        # detect rate limiting/quota errors from the exception message.
        if "429" in str(e) or "quota" in str(e).lower():
            raise RateLimitError(str(e)) from e

        raise


_PROVIDER_FNS = {
    "groq": _call_groq,
    "gemini": _call_gemini,
}


# ── Public provider retry wrapper ────────────────────────────────────────
@retry(
    reraise=True,
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=15),
    retry=retry_if_exception_type(RateLimitError),
)
async def _call_with_retry(
    provider: Provider,
    prompt: str,
    system: str | None,
    json_mode: bool,
) -> str:
    async with _SEMAPHORES[provider]:
        return await _PROVIDER_FNS[provider](
            prompt,
            system,
            json_mode,
        )


# ── Public entry point ───────────────────────────────────────────────────

async def call_llm(
    prompt: str,
    default: Provider = "gemini",
    system: str | None = None,
    json_mode: bool = False,
    parse_json: bool = False,
) -> str | dict | list:
    """
    Call an LLM with automatic retry + provider fallback.

    API keys are rotated round-robin independently for each provider.

    Args:
        prompt: the user prompt.
        default: which provider to try first ("gemini" or "groq").
        system: optional system prompt.
        json_mode: ask the provider to constrain output to valid JSON.
        parse_json: if True, parse the response into a dict/list before returning.

    Returns:
        str (or dict/list if parse_json=True).

    Raises:
        LLMError if both providers fail.
    """
    fallback: Provider = (
        "groq"
        if default == "gemini"
        else "gemini"
    )

    for provider in (default, fallback):
        try:
            logger.info(
                "Calling %s",
                provider,
            )

            text = await _call_with_retry(
                provider,
                prompt,
                system,
                json_mode,
            )

            if parse_json:
                return _safe_json_parse(text)

            return text

        except RateLimitError:
            logger.warning(
                "%s rate-limited after retries, falling back",
                provider,
            )
            continue

        except Exception as e:
            logger.warning(
                "%s failed (%s), falling back",
                provider,
                e,
            )
            continue

    raise LLMError(
        f"Both providers failed for prompt starting: {prompt[:80]!r}"
    )


def _safe_json_parse(text: str) -> dict | list:
    """LLMs sometimes wrap JSON in ```json fences even when asked not to."""
    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")

        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]

        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError as e:
        raise LLMError(
            f"Model did not return valid JSON: {e}\n"
            f"Raw: {text[:200]}"
        ) from e
