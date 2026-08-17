"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * Pillola flottante "Analizza la tua tecnica" agganciata sotto la nav.
 * Visibile solo mentre l'utente scorre il corpo della pagina, tra la CTA
 * dell'hero e quella di chiusura — vicino a entrambe si nasconde per non
 * duplicare una CTA già a schermo.
 */
export function StickyAnalyzeCta({ label, href }: { label: string; href: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroAnchor = document.getElementById("hero-cta-anchor");
    const finalAnchor = document.getElementById("final-cta-anchor");
    if (!heroAnchor || !finalAnchor) return;

    let heroPassed = false;
    let finalNear = false;

    const update = () => setVisible(heroPassed && !finalNear);

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        update();
      },
      { threshold: 0 }
    );
    const finalObserver = new IntersectionObserver(
      ([entry]) => {
        finalNear = entry.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "0px 0px -20% 0px" }
    );

    heroObserver.observe(heroAnchor);
    finalObserver.observe(finalAnchor);
    return () => {
      heroObserver.disconnect();
      finalObserver.disconnect();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed left-1/2 -translate-x-1/2 z-30 hidden md:block"
          style={{ top: "5.25rem" }}
        >
          <Link
            href={href}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white shadow-[0_14px_30px_-10px_rgba(233,69,96,.55)] transition-transform hover:-translate-y-0.5"
            style={{ background: "var(--organic-terracotta)" }}
          >
            {label} <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
