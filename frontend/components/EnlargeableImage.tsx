"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export function EnlargeableImage({
  src,
  alt,
  className,
  layoutId,
}: {
  src: string;
  alt: string;
  className?: string;
  layoutId: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <motion.img
        layoutId={layoutId}
        src={src}
        alt={alt}
        onClick={() => setOpen(true)}
        whileHover={{ rotate: 2, scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`cursor-zoom-in ${className || ""}`}
        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
      />

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-8"
                onClick={() => setOpen(false)}
              >
                <motion.img
                  layoutId={layoutId}
                  src={src}
                  alt={alt}
                  transition={{ type: "spring", stiffness: 250, damping: 24 }}
                  className="max-w-2xl max-h-[80vh] object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}