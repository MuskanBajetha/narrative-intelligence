"use client";


import { Footprints } from "./motifs/Footprints";

const palette = ["#6b8068", "#3f5a44", "#b5654a", "#c99a3f"];

function SceneSkyline({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 220" className="w-full h-40 sm:h-56">
      <rect x="0" y="140" width="120" height="80" fill={color} opacity="0.25" />
      <rect x="130" y="90" width="90" height="130" fill={color} opacity="0.4" />
      <polygon points="260,90 300,40 340,90" fill={color} opacity="0.5" />
      <rect x="260" y="90" width="80" height="130" fill={color} opacity="0.5" />
      <rect x="440" y="60" width="100" height="160" fill={color} opacity="0.6" />
      <rect x="650" y="80" width="90" height="140" fill={color} opacity="0.45" />
    </svg>
  );
}

function SceneDocuments({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 220" className="w-full h-40 sm:h-56">
      <rect x="120" y="30" width="160" height="200" fill={color} opacity="0.3" transform="rotate(-6 200 130)" />
      <rect x="300" y="50" width="160" height="200" fill={color} opacity="0.55" transform="rotate(4 380 150)" />
      <rect x="480" y="20" width="160" height="200" fill={color} opacity="0.4" transform="rotate(-3 560 120)" />
      <line x1="150" y1="70" x2="250" y2="70" stroke="var(--ink)" strokeWidth="2" opacity="0.3" />
      <line x1="150" y1="90" x2="230" y2="90" stroke="var(--ink)" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

function SceneGavel({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 220" className="w-full h-40 sm:h-56">
      <rect x="360" y="180" width="80" height="14" fill={color} opacity="0.5" />
      <rect x="390" y="60" width="20" height="120" fill={color} opacity="0.6" />
      <rect x="330" y="40" width="140" height="40" rx="8" fill={color} opacity="0.55" />
      <circle cx="150" cy="150" r="30" fill={color} opacity="0.25" />
      <circle cx="650" cy="150" r="30" fill={color} opacity="0.25" />
    </svg>
  );
}


function SceneFootprints({ color }: { color: string }) {
  return <Footprints color={color} opacity={0.35} />;
}


function SceneNetwork({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 800 220" className="w-full h-40 sm:h-56">
      <circle cx="150" cy="110" r="14" fill={color} opacity="0.6" />
      <circle cx="350" cy="60" r="10" fill={color} opacity="0.5" />
      <circle cx="400" cy="160" r="12" fill={color} opacity="0.55" />
      <circle cx="600" cy="90" r="16" fill={color} opacity="0.6" />
      <circle cx="700" cy="150" r="9" fill={color} opacity="0.45" />
      <line x1="150" y1="110" x2="350" y2="60" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="350" y1="60" x2="400" y2="160" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="400" y1="160" x2="600" y2="90" stroke={color} strokeWidth="1.5" opacity="0.4" />
      <line x1="600" y1="90" x2="700" y2="150" stroke={color} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

const scenes = [SceneSkyline, SceneDocuments, SceneGavel, SceneFootprints, SceneNetwork];

export function ChapterIllustration({ seed }: { seed: number }) {
  const color = palette[seed % palette.length];
  const Scene = scenes[seed % scenes.length];
  return <Scene color={color} />;
}