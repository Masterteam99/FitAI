"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { CountUp } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

const RING_R = 60;
const RING_C = 2 * Math.PI * RING_R;

// Card "analisi biomeccanica" del hero organico: anello animato + metriche.
export function OrganicHeroVisual() {
  const reduced = useReducedMotion();
  const card = copy.landing.scoreCard;
  const progress = card.score / 100;

  return (
    <div className="relative">
      <div className="organic-glass rounded-[32px] p-8 relative overflow-hidden">
        <div className="text-xs uppercase tracking-[0.18em] font-bold mb-1.5" style={{ color: "var(--organic-sage-deep)" }}>
          {card.tag}
        </div>
        <h3 className="font-display text-xl mb-6">{card.title}</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="relative w-[140px] h-[140px] shrink-0">
            <svg width="140" height="140" className="-rotate-90" aria-hidden="true">
              <circle cx="70" cy="70" r={RING_R} fill="none" stroke="var(--organic-line)" strokeWidth="12" />
              <motion.circle
                cx="70" cy="70" r={RING_R}
                fill="none"
                stroke="url(#organic-ring-gradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                initial={{ strokeDashoffset: reduced ? RING_C * (1 - progress) : RING_C }}
                whileInView={{ strokeDashoffset: RING_C * (1 - progress) }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
              />
              <defs>
                <linearGradient id="organic-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8a9a7b" />
                  <stop offset="1" stopColor="#3fae5a" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-4xl leading-none" style={{ color: "var(--organic-espresso)" }}>
                <CountUp value={card.score} />
              </span>
              <small className="text-[10px] uppercase tracking-widest text-muted-foreground">{card.scoreLabel}</small>
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            {card.rows.map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2.5 border-b border-border last:border-none text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                {row.chip ? (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: "rgba(138,154,123,.22)", color: "var(--organic-sage-deep)" }}
                  >
                    {row.value}
                  </span>
                ) : (
                  <b className="font-semibold">{row.value}</b>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="organic-glass organic-floaty absolute -bottom-6 -left-4 sm:-left-7 rounded-[18px] px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: "var(--organic-terracotta)", color: "var(--organic-cream)" }}>
          <Check className="w-5 h-5" />
        </div>
        <div>
          <b className="block text-sm font-semibold">{copy.landing.floatCard.title}</b>
          <span className="text-xs text-muted-foreground">{copy.landing.floatCard.sub}</span>
        </div>
      </div>
    </div>
  );
}
