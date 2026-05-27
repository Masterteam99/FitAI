"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";

export type AchievementPayload = {
  icon: string;
  name: string;
  points?: number;
  rarity?: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
};

const RARITY_GLOW: Record<NonNullable<AchievementPayload["rarity"]>, string> = {
  COMMON: "shadow-[0_0_60px_-10px_var(--muted-foreground)]",
  UNCOMMON: "shadow-[0_0_60px_-10px_var(--energy-cool)]",
  RARE: "shadow-[0_0_70px_-10px_var(--energy-cool)]",
  EPIC: "shadow-[0_0_80px_-10px_var(--energy-warm)]",
  LEGENDARY: "shadow-[0_0_100px_-5px_var(--energy-hot)]",
};

const RARITY_COLOR: Record<NonNullable<AchievementPayload["rarity"]>, string> = {
  COMMON: "border-muted-foreground/40",
  UNCOMMON: "border-energy-cool/60",
  RARE: "border-energy-cool",
  EPIC: "border-energy-warm",
  LEGENDARY: "border-energy-hot",
};

const EVENT_NAME = "fitai:achievement-unlocked";

export function emitAchievement(payload: AchievementPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AchievementPayload>(EVENT_NAME, { detail: payload }));
}

function fireConfetti(reduced: boolean) {
  if (reduced) return;
  const colors = ["#22c55e", "#f59e0b", "#ef4444", "#fef3c7"];
  const burst = (origin: { x: number; y: number }) =>
    confetti({
      particleCount: 60,
      spread: 90,
      startVelocity: 55,
      origin,
      colors,
      scalar: 1.1,
      ticks: 200,
    });
  burst({ x: 0.2, y: 0.6 });
  burst({ x: 0.8, y: 0.6 });
  setTimeout(() => burst({ x: 0.5, y: 0.5 }), 250);
}

export function AchievementUnlockProvider() {
  const [current, setCurrent] = useState<AchievementPayload | null>(null);
  const reduced = useReducedMotion() ?? false;

  const dismiss = useCallback(() => setCurrent(null), []);

  useEffect(() => {
    function onUnlock(ev: Event) {
      const detail = (ev as CustomEvent<AchievementPayload>).detail;
      if (!detail) return;
      setCurrent(detail);
      fireConfetti(reduced);
    }
    window.addEventListener(EVENT_NAME, onUnlock as EventListener);
    return () => window.removeEventListener(EVENT_NAME, onUnlock as EventListener);
  }, [reduced]);

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(dismiss, 3500);
    return () => clearTimeout(t);
  }, [current, dismiss]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -15, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className={`pointer-events-auto bg-card border-2 ${RARITY_COLOR[current.rarity ?? "COMMON"]} ${RARITY_GLOW[current.rarity ?? "COMMON"]} rounded-2xl px-8 py-6 max-w-sm text-center cursor-pointer`}
          >
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 14 }}
              className="text-7xl mb-3"
            >
              {current.icon}
            </motion.div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                Achievement sbloccato
              </div>
              <div className="text-display-md text-foreground mb-2">{current.name}</div>
              {current.points !== undefined && (
                <div className="text-energy-warm text-sm font-semibold">+{current.points} punti</div>
              )}
              {current.rarity && (
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] opacity-60">
                  {current.rarity}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
