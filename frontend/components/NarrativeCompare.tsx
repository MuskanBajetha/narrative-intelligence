"use client";

import { motion } from "framer-motion";
import { Narrative } from "@/lib/api";

export function NarrativeCompare({ narratives }: { narratives: Narrative[] }) {
  if (narratives.length === 0) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 mt-10">
      {narratives.map((n, i) => (
        <motion.div
          key={n.narrative_name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="border-t-2 border-[var(--ink)] pt-4"
        >
          <p className="text-xs uppercase tracking-widest text-[var(--terracotta)] mb-1">
            {n.stance_balance}
          </p>
          <h4 className="font-display text-xl mb-2">{n.narrative_name}</h4>
          <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{n.summary}</p>

          {n.evidence && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[var(--ink-soft)] mb-1">
                <span>Evidence strength</span>
                <span>{n.evidence.evidence_strength}%</span>
              </div>
              <div className="h-1 bg-[var(--ink)]/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${n.evidence.evidence_strength}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-[var(--sage-deep)]"
                />
              </div>
            </div>
          )}
          <p className="text-xs text-[var(--ink-soft)]/70 mt-2">
            {n.claims.length} supporting claims
          </p>
        </motion.div>
      ))}
    </div>
  );
}