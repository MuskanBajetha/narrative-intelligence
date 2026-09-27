# Narrative Intelligence Engine

**An AI investigative newsroom.** Give it a topic, and a multi-agent pipeline
searches sources, extracts events and claims, tracks how belief and evidence
shifted over time, surfaces contradictions between competing accounts, and
hands back an interactive, cinematic documentary — not a search results page.

🔗 **Live demo:** [https://narrative-intelligence-xi.vercel.app/](https://narrative-intelligence-xi.vercel.app/) 

---

## What it does

1. **Discovery** — searches Tavily + Wikipedia for sources on the topic, filtered for relevance
2. **Extraction** — pulls structured events and claims out of raw source text
3. **Narrative Discovery** — clusters claims into competing storylines
4. **Contradiction Detection** — finds where narratives directly conflict, loops back to Discovery for more evidence if unresolved
5. **Evidence Verification** — scores each narrative's evidence strength
6. **News Enrichment** — pulls related coverage from The Guardian Open Platform
7. **Story Architect** — designs a chaptered documentary structure with punchy prose, scaled to the topic's real timespan
8. **Frontend** — renders it all as a scroll-driven cinematic experience: chapter intros with duotone transitions, an animated investigation trail, evidence boards, and a fixed expandable timeline

Investigations are cached (with semantic deduplication — "NEET paper leak" and
"NEET leak 2024" resolve to the same story) so the same topic is never
re-investigated from scratch.

## Tech stack

- **Backend:** Python, FastAPI, LangGraph (agent orchestration), Groq + Gemini (LLMs, with automatic fallback and multi-key rotation), Tavily (search), SQLAlchemy + PostgreSQL
- **Frontend:** Next.js, TypeScript, Tailwind CSS, Framer Motion, GSAP + Lenis (scroll choreography), NextAuth (Google + email/password auth)

## Project structure

```
backend/
  app/
    agents/       # each pipeline step (discovery, extraction, narrative discovery, etc.)
    core/         # LangGraph orchestration, LLM router, config
    api/          # FastAPI routes
    db/           # SQLAlchemy models + repository
frontend/
  app/            # Next.js App Router pages (landing, dashboard, investigate, story)
  components/     # UI components (chapters, evidence board, timeline, motifs)
  lib/            # API client, helpers
```

## Running it locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A local PostgreSQL instance (or a free [Neon](https://neon.tech) database)
- API keys: [Groq](https://console.groq.com), [Google AI Studio (Gemini)](https://aistudio.google.com/apikey), [Tavily](https://tavily.com), [The Guardian Open Platform](https://open-platform.theguardian.com/access/) (free), [Google OAuth credentials](https://console.cloud.google.com/apis/credentials)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env       # or `cp` on macOS/Linux
```

Fill in `.env` with your API keys and a `DATABASE_URL` pointing at your Postgres instance, then:

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/health` to confirm it's running.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

**`backend/.env`**
```
GROQ_API_KEYS=key1,key2,key3          # comma-separated, supports multiple accounts
GEMINI_API_KEYS=key1,key2
GROQ_MODEL=qwen/qwen3.8-27b           # check console.groq.com/docs/models for current names
GEMINI_MODEL=gemini-3.8-flash
TAVILY_API_KEY=
GUARDIAN_API_KEY=
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=                 # any random string
NEXTAUTH_URL=http://localhost:3000
```

## Known limitations

- Free-tier LLM rate limits mean investigations can take 1-3 minutes; multi-key rotation and request throttling are in place to reduce failures, not eliminate them entirely.
- News enrichment currently uses The Guardian only — coverage will be thin or empty for topics outside their beat.
- This is a personal/portfolio project, not hardened for production traffic (no request rate limiting on the API, minimal input validation).

## License

MIT — do whatever you'd like with it.
