"use client";

import type { ReactNode } from "react";
import { useScrollStep } from "@/components/motion/MotionPrimitives";
import { cn } from "@/lib/utils";

export interface ExplainerStep {
  title: string;
  desc: string;
}

export function ScrollExplainer({
  steps,
  className,
  visuals,
  stepVh = 80,
}: {
  steps: ExplainerStep[];
  className?: string;
  /** Un elemento per step, indicizzato dallo step attivo. Passato come array
   *  (non funzione) per attraversare il confine server→client component. */
  visuals?: ReactNode[];
  /** Altezza di scroll per step, in vh. Default 80. */
  stepVh?: number;
}) {
  const { ref, active } = useScrollStep<HTMLDivElement>(steps.length);

  return (
    <div ref={ref} className={cn("relative", className)} style={{ minHeight: `${steps.length * stepVh}vh` }}>
      <div className="sticky top-0 grid lg:grid-cols-2 gap-10 items-center min-h-[100dvh] py-16">
        <div className="space-y-5">
          {steps.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={i}
                className="flex gap-4 transition-all duration-500"
                style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? "translateX(0)" : "translateX(-6px)" }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-full grid place-items-center font-display text-sm transition-colors duration-500"
                  style={{
                    background: isActive ? "var(--organic-green)" : "var(--organic-line)",
                    color: isActive ? "var(--organic-cream)" : "var(--organic-sage-deep)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-[42ch]">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden lg:flex items-center justify-center min-h-[320px]">
          {visuals?.[active] ?? null}
        </div>
      </div>
    </div>
  );
}
