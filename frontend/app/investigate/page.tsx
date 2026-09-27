"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { investigateStream, ProgressEvent } from "@/lib/api";
import { CinematicLoader } from "@/components/CinematicLoader";
import { storyUrl } from "@/lib/api";


function InvestigateContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [progressLog, setProgressLog] = useState<ProgressEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const topic = params.get("topic") || "";

  useEffect(() => {
    if (!topic.trim()) return;
    if (status === "loading") return; // wait for session to resolve first

    investigateStream(
      topic,
      (p) => setProgressLog((prev) => [...prev, p]),
      (data) => {
        sessionStorage.setItem(`investigation:${data.topic}`, JSON.stringify(data));
        router.replace(storyUrl(data.topic));
      },

      (message) => setError(message),
      false,
      (session?.user as any)?.googleId,
      session?.user?.email || undefined,
      session?.user?.name || undefined
    );
  }, [topic, status]);

  return (
    <main className="min-h-screen flex items-center justify-center grain">
      {error ? (
        <p className="text-[var(--terracotta)]">{error}</p>
      ) : (
        <CinematicLoader log={progressLog} />
      )}
    </main>
  );
}

export default function InvestigatePage() {
  return (
    <Suspense fallback={null}>
      <InvestigateContent />
    </Suspense>
  );
}