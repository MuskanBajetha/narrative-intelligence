"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollTrail() {
  const { scrollYProgress } = useScroll();
  const top = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="hidden lg:block fixed right-10 top-0 h-full w-px z-0 pointer-events-none">
      <div
        className="absolute inset-0 border-l border-dashed"
        style={{ borderColor: "var(--ink)", opacity: 0.15 }}
      />
      <motion.div
        className="absolute left-0 w-2.5 h-2.5 rounded-full -translate-x-[4.5px]"
        style={{ backgroundColor: "var(--terracotta)", top }}
      />
    </div>
  );
}