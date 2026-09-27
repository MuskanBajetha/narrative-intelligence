"use client";

import { createContext, useContext, useRef, useState } from "react";

interface TintContextValue {
  setTint: (color: string) => void;
}

const TintContext = createContext<TintContextValue | null>(null);

export function ChapterTintProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState("transparent");

  return (
    <TintContext.Provider value={{ setTint: setColor }}>
      <div
        className="fixed inset-0 pointer-events-none z-[5] transition-colors duration-700 ease-out"
        style={{ backgroundColor: color, opacity: color === "transparent" ? 0 : 0.15, mixBlendMode: "multiply" }}
      />
      {children}
    </TintContext.Provider>
  );
}

export function useChapterTint() {
  const ctx = useContext(TintContext);
  if (!ctx) throw new Error("useChapterTint must be used within ChapterTintProvider");
  return ctx;
}