"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { InvestigationCard } from "@/components/InvestigationCard";
import type { DashboardEntry } from "@/components/InvestigationCard";

const PLACEHOLDER_PHRASES = [
  "NEET paper leak 2024...",
  "Israel Gaza ceasefire...",
  "Russia Ukraine war...",
  "COVID-19 origins...",
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [topic, setTopic] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (status !== "authenticated") return;

    const googleId = (session?.user as any)?.googleId;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/${googleId}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [status, session]);

  // typewriter cycling placeholder
  useEffect(() => {
    const full = PLACEHOLDER_PHRASES[placeholderIdx];
    let i = 0;

    const type = setInterval(() => {
      i++;
      setTypedPlaceholder(full.slice(0, i));

      if (i >= full.length) {
        clearInterval(type);

        setTimeout(
          () =>
            setPlaceholderIdx(
              (p) => (p + 1) % PLACEHOLDER_PHRASES.length
            ),
          1800
        );
      }
    }, 55);

    return () => clearInterval(type);
  }, [placeholderIdx]);

  function startInvestigation() {
    if (!topic.trim()) return;

    router.push(`/investigate?topic=${encodeURIComponent(topic.trim())}`);
  }

  if (status === "loading") return null;

  if (status !== "authenticated") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "#FBE9D0" }}
      >
        <p style={{ color: "#4a5142" }}>
          Sign in to view your dashboard.
        </p>

        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 border rounded-full"
          style={{ borderColor: "#24291f" }}
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#FBE9D0" }}
    >
      <style jsx global>{`
        .dashboard-search-input::placeholder {
          color: rgba(0, 0, 0, 0.70);
        }
      `}</style>

      {/* ── HERO: desk illustration + greeting + search ───────────────── */}
      <section
        className="relative min-h-[70vh] flex flex-col justify-end px-6 sm:px-12 pb-16 overflow-hidden"
        style={{
          backgroundImage: "url(/images/desk-hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center 65%",
        }}
      >
        {/* teal-to-parchment scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(36,72,85,0.45) 0%, rgba(36,72,85,0.20) 40%, #FBE9D0 100%)",
          }}
        />

        <div className="relative z-10 flex justify-between items-start mb-auto pt-8">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-white/90">
            Narrative Intelligence
          </p>

          <p className="font-mono text-sm text-white/90">
            {session?.user?.name}
          </p>
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl sm:text-6xl font-bold leading-[1.05] text-white mb-8"
          >
            Good evening.
            <br />

            <span
              style={{
                color: "var(--terracotta)",
                textShadow: "1.1px 1.1px rgba(255,255,255,0.70)",
              }}
            >
              What are we investigating today?
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-end gap-0 border-b-2 pb-3 max-w-xl relative"
            style={{ color: "var(--ink)" }}
          >
            <input
              className="flex-1 bg-transparent outline-none font-display text-2xl sm:text-3xl placeholder:font-normal dashboard-search-input"
              style={{
                color: "var(--ink)",
                textShadow: "0px 0px rgba(255,255,255,0.95)",
              }}
              placeholder={typedPlaceholder}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && startInvestigation()
              }
            />

            <button
              onClick={startInvestigation}
              className="font-mono text-sm uppercase tracking-widest whitespace-nowrap pb-1 font-bold"
              style={{
                color: "var(--ink)",
                textShadow: "1px 1px rgba(255,255,255,0.45)",
              }}
            >
              Investigate →
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── YOUR INVESTIGATIONS ─────────────────────────────────────── */}
      <section
        className="relative px-6 sm:px-12 py-16 overflow-hidden"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();

          setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(0,0,0,0.025), transparent 22%),
              radial-gradient(circle at 75% 70%, rgba(0,0,0,0.02), transparent 24%),
              linear-gradient(115deg, rgba(255,255,255,0.12), transparent 40%)
            `,
          }}
        />

        {/* spotlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: `radial-gradient(
              420px circle at ${mouse.x}px ${mouse.y}px,
              rgba(255,255,255,0.16),
              transparent 72%
            )`,
          }}
          transition={{
            duration: 0.15,
            ease: "linear",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-baseline gap-3 mb-2">
            <p
              className="font-mono text-[10px] tracking-[0.3em] uppercase"
              style={{ color: "#874F41" }}
            >
              Archive
            </p>

            <div
              className="h-px flex-1"
              style={{
                backgroundColor: "#24291f",
                opacity: 0.1,
              }}
            />
          </div>

          <h2
            className="font-display text-3xl font-bold mb-8"
            style={{ color: "#24291f" }}
          >
            Your investigations
          </h2>

          {entries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {entries.slice(0, 12).map((e, i) => (
                <InvestigationCard
                  key={i}
                  entry={e}
                  index={i}
                />
              ))}

              {entries.length > 12 && (
                <a
                  href="/dashboard/archive"
                  className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed transition-colors hover:bg-black/5"
                  style={{
                    borderColor: "#874F41",
                    minHeight: "280px",
                  }}
                >
                  <span
                    className="font-display text-3xl font-bold mb-2"
                    style={{ color: "#874F41" }}
                  >
                    +{entries.length - 12}
                  </span>

                  <span
                    className="font-mono text-xs uppercase tracking-widest"
                    style={{ color: "#874F41" }}
                  >
                    More →
                  </span>
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center text-center py-20 relative">
      <svg
        viewBox="0 0 300 180"
        className="w-72 h-44 mb-6 opacity-90"
      >
        {/* desk surface */}
        <rect
          x="0"
          y="140"
          width="300"
          height="10"
          fill="#90AEAD"
          opacity="0.4"
        />

        {/* typewriter */}
        <rect
          x="30"
          y="90"
          width="70"
          height="45"
          rx="4"
          fill="#874F41"
          opacity="0.5"
        />

        <rect
          x="40"
          y="80"
          width="50"
          height="14"
          rx="2"
          fill="#874F41"
          opacity="0.35"
        />

        {/* newspaper */}
        <rect
          x="120"
          y="95"
          width="60"
          height="42"
          fill="#EAE7DC"
          stroke="#24291f"
          strokeOpacity="0.2"
        />

        <line
          x1="128"
          y1="106"
          x2="172"
          y2="106"
          stroke="#24291f"
          strokeOpacity="0.3"
          strokeWidth="2"
        />

        <line
          x1="128"
          y1="114"
          x2="160"
          y2="114"
          stroke="#24291f"
          strokeOpacity="0.2"
        />

        <line
          x1="128"
          y1="120"
          x2="165"
          y2="120"
          stroke="#24291f"
          strokeOpacity="0.2"
        />

        {/* mug */}
        <circle
          cx="215"
          cy="118"
          r="14"
          fill="#E64833"
          opacity="0.6"
        />

        <path
          d="M229 112 q10 0 10 8 q0 8 -10 8"
          stroke="#E64833"
          strokeWidth="3"
          fill="none"
          opacity="0.6"
        />

        {/* magnifying glass */}
        <circle
          cx="255"
          cy="95"
          r="16"
          fill="none"
          stroke="#244855"
          strokeWidth="3"
          opacity="0.6"
        />

        <line
          x1="266"
          y1="106"
          x2="278"
          y2="118"
          stroke="#244855"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* pinned note */}
        <rect
          x="30"
          y="50"
          width="45"
          height="30"
          fill="#c99a3f"
          opacity="0.3"
          transform="rotate(-4 52 65)"
        />
      </svg>

      <p
        className="font-display text-xl italic max-w-xs"
        style={{ color: "#4a5142" }}
      >
        Every investigation begins with a single question.
      </p>
    </div>
  );
}
