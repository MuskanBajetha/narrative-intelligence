"use client";

import { useEffect, useRef, useState } from "react";

export function CursorTrail() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () =>
      window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1024;

    setIsDesktop(checkDesktop());

    if (!checkDesktop()) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let raf = 0;

    function onMove(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    }

    function animate() {
    const targetX = mouseX - 16; // left side of cursor
    const targetY = mouseY + 3;

    // very fast but smooth follow
    dotX += (targetX - dotX) * 0.75;
    dotY += (targetY - dotY) * 0.75;

    // lock when nearly stopped
    if (Math.abs(targetX - dotX) < 0.05) dotX = targetX;
    if (Math.abs(targetY - dotY) < 0.05) dotY = targetY;

    if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    }

    raf = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div
        ref={dotRef}
        className="
            fixed
            top-0
            left-0
            w-3
            h-3
            rounded-full
            pointer-events-none
            z-[100]
        "
        style={{
            backgroundColor: "#000",
            opacity: 0.95,
            willChange: "transform",
        }}
    />
  );
}