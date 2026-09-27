# Narrative Intelligence Engine

Multi-agent system that reconstructs how stories, narratives, and public beliefs
evolve over time — presented as an interactive documentary rather than a search result.

## Status: Phase 1 — Foundation ✅

What exists right now:
- FastAPI backend skeleton with a `/health` endpoint
- LLM router (`app/core/llm_router.py`) — unified interface over Groq + Gemini,
  with automatic retry and fallback between providers
- Config loader reading from `.env`
- Smoke test script to confirm both LLM providers work

Not built yet (upcoming phases): search/discovery, extraction agents,
belief/narrative agents, orchestration graph, frontend.

## Setup (Windows / VS Code)

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Now open `.env` and fill in:
- `GROQ_API_KEY` — from https://console.groq.com
- `GEMINI_API_KEY` — from https://aistudio.google.com/apikey
- `TAVILY_API_KEY` — from https://tavily.com
- `DATABASE_URL` — point at your local Postgres, e.g.
  `postgresql://postgres:yourpassword@localhost:5432/narrative_engine`
  (create the `narrative_engine` database first: `createdb narrative_engine`
  or via pgAdmin)

### 2. Verify the LLM router works

```powershell
python -m tests.test_llm_router
```

You should see both "Gemini is working" and "Groq is working" printed, plus a
parsed JSON object. If a provider fails, check the API key and that you haven't
hit the free-tier rate limit (wait a minute and retry).

### 3. Run the API

```powershell
uvicorn app.main:app --reload
```

Visit http://localhost:8000/health — you should see `"status": "ok"` and
confirmation that your keys are loaded (`true`/`false` flags, not the keys themselves).

## Next step (Phase 2)

Discovery Agent (Tavily + Wikipedia fallback) and Event/Claim Extraction agents,
run as a linear script against a real topic — before we introduce any looping
orchestration.
