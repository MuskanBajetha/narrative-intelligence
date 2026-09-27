"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { InvestigationCard } from "@/components/InvestigationCard";
import type { DashboardEntry } from "@/components/InvestigationCard";

export default function ArchivePage() {
  const { data: session, status } = useSession();
  const [entries, setEntries] = useState<DashboardEntry[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const googleId = (session?.user as any)?.googleId;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/dashboard/${googleId}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [status, session]);

  if (status === "loading") return null;

  return (
    <main
      className="min-h-screen px-6 sm:px-12 py-12"
      style={{ backgroundColor: "#FBE9D0" }}
    >
      <Link
        href="/dashboard"
        className="font-mono text-xs uppercase tracking-widest"
        style={{ color: "#874F41" }}
      >
        ← Back to dashboard
      </Link>

      <h1
        className="font-display text-4xl font-bold mt-6 mb-10"
        style={{ color: "#24291f" }}
      >
        Your investigations archive
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {entries.map((e, i) => (
          <InvestigationCard
            key={i}
            entry={e}
            index={i}
          />
        ))}
      </div>
    </main>
  );
}
