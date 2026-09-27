"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { AuthModal } from "@/components/AuthModal";
import { NewsColumnSilhouette } from "@/components/motifs/NewsColumnSilhouette";
import { FilmstripMotif } from "@/components/motifs/FilmstripMotif";

export default function Landing() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  function handleBegin() {
    if (session) router.push("/dashboard");
    else setShowAuth(true);
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main
      className="relative grain"
      style={{
        // ONE gradient for the entire page — this is what removes the seams.
        // It spans main's full natural height automatically; nothing per-section.
        background: "linear-gradient(180deg, #244855 0%, #874F41 32%, #E98074 52%, #EAE7DC 74%, #FBE9D0 100%)",
      }}
    >
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 sm:px-12 py-4 backdrop-blur-md bg-black/10 border-b border-white/10">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-white">Narrative Intelligence</p>
        <div className="hidden sm:flex items-center gap-8">
          <button onClick={() => scrollTo("hero")} className="text-sm text-white/85 hover:text-white transition-colors">About</button>
          <button onClick={() => scrollTo("method")} className="text-sm text-white/85 hover:text-white transition-colors">Method</button>
          <button onClick={() => scrollTo("experience")} className="text-sm text-white/85 hover:text-white transition-colors">Experience</button>
        </div>
        {session ? (
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-white underline decoration-dotted underline-offset-4">Dashboard</a>
            <button onClick={() => signOut()} className="text-sm text-white/70">Sign out</button>
          </div>
        ) : (
          <button onClick={() => setShowAuth(true)} className="text-sm px-4 py-1.5 rounded-full border border-white text-white">
            Sign in
          </button>
        )}
      </nav>

      <HeroSection onBegin={handleBegin} />
      <ProcessSection />
      <ExperienceSection onBegin={handleBegin} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  );
}

function HeroSection({ onBegin }: { onBegin: () => void }) {
  return (
    <section
      id="hero"
      className="min-h-screen grid lg:grid-cols-2 items-center px-6 sm:px-12 relative overflow-hidden"
      style={{ scrollMarginTop: "72px" }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />

      <div className="relative z-10 py-32">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs tracking-[0.4em] uppercase mb-6" style={{ color: "#E64833" }}>
          An AI investigative newsroom
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9 }}
          className="font-display font-bold leading-[1.05] max-w-lg"
          style={{ color: "#FBE9D0" }}
        >
          <span className="block text-5xl sm:text-6xl">Every headline has a history.</span>
          <span className="block text-3xl sm:text-4xl mt-2 italic" style={{ color: "#E64833" }}>
            Every narrative leaves fingerprints.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6 text-lg max-w-md leading-relaxed" style={{ color: "#90AEAD" }}
        >
          Every major event leaves behind a trail — first reports, official denials, leaked
          documents, shifting public opinion. Give us a topic, and we'll reconstruct how it
          actually unfolded.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
          whileHover={{ scale: 1.04 }}
          onClick={onBegin}
          className="mt-12 px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest font-semibold"
          style={{ backgroundColor: "#E64833", color: "#FBE9D0" }}
        >
          Begin Investigating →
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10 hidden lg:block h-[70vh]"
      >
        <NewsColumnSilhouette />
      </motion.div>
    </section>
  );
}

function ProcessSection() {
  const STAGES = [
    { label: "Topic", text: "You name an event. Nothing more — no framing, no angle." },
    { label: "Sources collected", text: "We search news archives, official statements, and public records." },
    { label: "Claims compared", text: "Every assertion set beside the others — who said what, and when." },
    { label: "Events reconstructed", text: "A real timeline emerges, backed by evidence." },
    { label: "Contradictions exposed", text: "Where sources disagree, we show you the fault line." },
    { label: "Documentary generated", text: "The investigation becomes a chaptered account you explore." },
  ];

  return (
    <section
      id="method"
      className="min-h-screen py-32 px-6 sm:px-12 grid lg:grid-cols-[1fr_1.3fr] gap-16 relative"
      style={{ scrollMarginTop: "72px" }}
    >
      <div className="lg:sticky lg:top-32 h-fit">
        <p className="font-mono text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#7A2528" }}>How it unfolds</p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold" style={{ color: "#FBE9D0" }}>
          Not a summary. <br />An unfolding.
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px" style={{ backgroundColor: "#FBE9D0", opacity: 0.2 }} />
        {STAGES.map((stage, i) => (
          <ProcessStage key={stage.label} stage={stage} />
        ))}
      </div>
    </section>
  );
}

function ProcessStage({ stage }: { stage: { label: string; text: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover="hover"
      transition={{ duration: 0.5 }}
      className="relative pl-12 pb-16 last:pb-0 group cursor-default"
    >
      <motion.span
        variants={{ hover: { scale: 1.8, backgroundColor: "#E64833" } }}
        className="absolute left-[9px] top-1.5 w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: "#FBE9D0" }}
      />
      <motion.p
        variants={{ hover: { x: 8 } }}
        className="font-display text-2xl font-semibold mb-2"
        style={{ color: "#FBE9D0" }}
      >
        {stage.label}
      </motion.p>
      <motion.div
        variants={{ hover: { height: "auto", opacity: 1, marginTop: 4 } }}
        initial={{ opacity: 0.7 }}
        className="overflow-hidden"
      >
        <p className="leading-relaxed max-w-md" style={{ color: "#e0d5c5" }}>
          {stage.text}
        </p>
      </motion.div>
      {/* underline that draws in on hover — the "immersive" reveal, not a tilt/glow */}
      <motion.div
        variants={{ hover: { width: "100%" } }}
        initial={{ width: "0%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute bottom-0 left-12 h-px"
        style={{ backgroundColor: "#E64833" }}
      />
    </motion.div>
  );
}

function ExperienceSection({ onBegin }: { onBegin: () => void }) {
  const features = [
    { label: "Cinematic chapters", text: "Each phase gets its own scene, paced like a documentary." },
    { label: "Evolving timelines", text: "Watch belief and evidence shift as the story moves forward." },
    { label: "Evidence boards", text: "Photos, headlines, and sources pinned together." },
    { label: "Competing narratives", text: "Both sides laid out, scored, and left for you to weigh." },
  ];

  return (
    <section
      id="experience"
      className="min-h-screen py-32 px-6 sm:px-12 grid lg:grid-cols-2 items-center gap-16 relative"
      style={{ scrollMarginTop: "72px" }}
    >
      <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden lg:block h-[60vh]">
        <FilmstripMotif />
      </motion.div>

      <div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "#874F41" }}>What you receive</p>
        <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6" style={{ color: "#24291f" }}>
          A documentary only you control.
        </h2>
        <p className="mb-12 leading-relaxed max-w-md" style={{ color: "#4a5142" }}>
          Think of it as a documentary built around one story — except you set the pace,
          and every claim on screen links back to where it came from.
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <SpotlightCard key={f.label} feature={f} index={i} />
          ))}
        </div>
        <motion.button
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          onClick={onBegin} whileHover={{ scale: 1.04 }}
          className="mt-12 px-8 py-4 rounded-full font-mono text-sm uppercase tracking-widest font-semibold"
          style={{ backgroundColor: "#874F41", color: "#FBE9D0" }}
        >
          Start your first investigation →
        </motion.button>
      </div>
    </section>
  );
}

function SpotlightCard({ feature, index }: { feature: { label: string; text: string }; index: number }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      onMouseMove={handleMove}
      className="relative border-l-2 pl-4 py-3 pr-3 overflow-hidden rounded-r-md transition-colors duration-300"
      style={{ borderColor: index % 2 === 0 ? "#E64833" : "#874F41" }}
    >
      {/* cursor-following radial light — this is the "immersive" hover, not a tilt or glow */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle 140px at ${pos.x}% ${pos.y}%, rgba(230,72,51,0.12), transparent 70%)`,
        }}
      />
      <p className="relative font-display text-lg font-semibold mb-1" style={{ color: "#24291f" }}>{feature.label}</p>
      <p className="relative text-sm leading-relaxed" style={{ color: "#4a5142" }}>{feature.text}</p>
    </motion.div>
  );
}