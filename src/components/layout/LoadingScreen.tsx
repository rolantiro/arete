"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Page-load sequence: the brand mark draws itself in via a clipping
 * reveal, then the whole screen lifts away. Runs once per full
 * page load (not on client-side navigations), matching the way a
 * physical storefront's lights come up once when the doors open.
 */
export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-ink)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="overflow-hidden"
          >
            <span className="font-display text-3xl tracking-[0.25em] text-[var(--color-paper)] md:text-4xl">
              ARÉTÉ
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
