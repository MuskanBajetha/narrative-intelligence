"use client";

import { motion } from "framer-motion";
import { ChapterImage } from "@/lib/api";

const rotations = [-4, 3, -2, 5];

export function ChapterPhotos({ images }: { images: ChapterImage[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-6 my-10">
      {images.map((img, i) => (
        <motion.figure
          key={i}
          initial={{ opacity: 0, y: 20, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: rotations[i % rotations.length] }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: i * 0.15 }}
          className="bg-white p-2 pb-8 shadow-md w-48 sm:w-56"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.description || "Archival image"}
            className="w-full h-32 sm:h-36 object-cover grayscale-[15%] sepia-[10%]"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = "none";
            }}
          />
          {img.description && (
            <figcaption className="text-[10px] font-mono text-[var(--ink-soft)] mt-2 leading-snug">
              {img.description.slice(0, 80)}
            </figcaption>
          )}
        </motion.figure>
      ))}
    </div>
  );
}