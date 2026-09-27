import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

logging.basicConfig(level=settings.log_level)

from app.api.auth import router as auth_router


app = FastAPI(
    title="Narrative Intelligence Engine",
    description="Multi-agent system that reconstructs how stories and beliefs evolve.",
    version="0.1.0",
)

# Next.js dev server + your future deployed frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "https://narrative-intelligence-xi.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "env": settings.env,
        "groq_configured": bool(settings.groq_api_key),
        "gemini_configured": bool(settings.gemini_api_key),
        "tavily_configured": bool(settings.tavily_api_key),
    }

from app.api.investigate import router as investigate_router

app.include_router(investigate_router)

from app.db.session import init_db

app.include_router(auth_router)

@app.on_event("startup")
def on_startup():
    init_db()