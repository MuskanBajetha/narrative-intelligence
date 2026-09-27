"use client";

import { motion } from "framer-motion";

export function EvidenceStamp({
  strength,
  label,
  tiltSeed,
}: {
  strength: number;
  label: string;
  tiltSeed: number;
}) {
  const rotations = [-6, 4, -3, 7];
  const rotate = rotations[tiltSeed % rotations.length];
  const color =
   strength >= 70 ? "var(--sage-deep)" : strength >= 40 ? "var(--rust)" : "var(--terracotta)";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
      whileInView={{ opacity: 1, scale: 1, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
      className="inline-block border-2 px-4 py-2 mt-4"
      style={{ borderColor: color, color }}
    >
      <p className="font-display text-2xl font-bold leading-none">{strength}%</p>
      <p className="font-mono text-[10px] uppercase tracking-widest mt-0.5">{label} confidence</p>
    </motion.div>
  );
}