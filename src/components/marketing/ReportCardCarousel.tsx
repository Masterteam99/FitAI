"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ReportCardExample {
  exercise: string;
  score: number;
  verdict: string;
  risk: string;
  riskLevel: "basso" | "medio" | "alto";
  fixesTitle: string;
  fixes: readonly string[];
}

const RISK_STYLE: Record<ReportCardExample["riskLevel"], { bg: string; color: string }> = {
  basso: { bg: "rgba(217,248,126,.16)", color: "var(--organic-green-soft)" },
  medio: { bg: "rgba(255,181,71,.16)", color: "#ffb547" },
  alto: { bg: "rgba(233,69,96,.16)", color: "#ff8b98" },
};

const ROTATE_MS = 5500;

/**
 * Carosello di esempi di referto (sezione "Cosa ricevi" della landing): più
 * esempi reali invece di uno statico, per far vedere la varietà di casi che
 * l'analisi copre, non solo il migliore.
 */
export function ReportCardCarousel({ cards }: { cards: readonly ReportCardExample[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (cards.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % cards.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [cards.length]);

  const card = cards[index];
  const risk = RISK_STYLE[card.riskLevel];

  return (
    <div>
      <div className="rounded-[28px] p-7 md:p-8 overflow-hidden relative" style={{ background: "var(--organic-espresso)", color: "var(--foreground)", minHeight: 340 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="text-xs uppercase tracking-[0.16em] font-bold mb-4" style={{ color: "var(--organic-terracotta-soft)" }}>
              {card.exercise}
            </div>
            <div className="flex items-end justify-between mb-5">
              <div>
                <span className="font-display text-6xl leading-none" style={{ color: "var(--organic-green-soft)" }}>{card.score}</span>
                <span className="text-sm ml-2" style={{ color: "rgba(234,241,248,.6)" }}>su 100</span>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: risk.bg, color: risk.color }}>{card.risk}</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(234,241,248,.78)" }}>{card.verdict}</p>
            <div className="text-xs uppercase tracking-[0.14em] font-bold mb-3" style={{ color: "rgba(234,241,248,.5)" }}>{card.fixesTitle}</div>
            <ol className="space-y-3">
              {card.fixes.map((f, i) => (
                <li key={f} className="flex gap-3 text-sm" style={{ color: "rgba(234,241,248,.85)" }}>
                  <span className="shrink-0 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold" style={{ background: "rgba(234,241,248,.1)" }}>{i + 1}</span>
                  {f}
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </div>
      {cards.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          {cards.map((c, i) => (
            <button
              key={c.exercise}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Mostra esempio: ${c.exercise}`}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === index ? 22 : 8, background: i === index ? "var(--organic-green)" : "var(--organic-line)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
