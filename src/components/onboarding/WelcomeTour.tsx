"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, Dumbbell, Brain, Apple, Users, ChevronRight, X } from "lucide-react";

const STORAGE_KEY = "fitai-tour-completed";

const STEPS = [
  {
    icon: Zap,
    title: "Benvenuto in FitAI! 💪",
    body:
      "Il tuo personal trainer AI personale. In pochi minuti puoi: generare piani di allenamento personalizzati, analizzare la tua tecnica con video AI, tracciare nutrizione e progressi.",
    cta: null as { href: string; label: string } | null,
  },
  {
    icon: Dumbbell,
    title: "Genera il tuo piano AI",
    body: "Claude crea un piano basato su obiettivi, livello e attrezzatura. Puoi sostituirlo quando vuoi o crearne uno manuale.",
    cta: { href: "/allenamento/genera-ai", label: "Vai ai piani" },
  },
  {
    icon: Brain,
    title: "Analizza la tua tecnica",
    body: "Filma una serie con la camera, il nostro sistema 3-in-1 (biomeccanica + AI vision + confronto PT) ti dà feedback personalizzato.",
    cta: { href: "/analisi", label: "Prova l'analisi" },
  },
  {
    icon: Apple,
    title: "Traccia nutrizione e progressi",
    body: "Calorie, macros, sessioni completate, streak. Tutto in un colpo d'occhio. Il piano nutrizionale AI è incluso.",
    cta: null,
  },
  {
    icon: Users,
    title: "Tutto pronto!",
    body: "Esplora dalla navbar laterale. Quando completi una sessione apparirà nel feed Community. Buon allenamento!",
    cta: null,
  },
];

export function WelcomeTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ completedAt: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Chiudi tour"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <h2 id="tour-title" className="text-xl font-bold">{s.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        <div className="flex gap-2 mt-5">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="flex-1">
              Indietro
            </Button>
          )}
          {s.cta && (
            <Button asChild variant="outline" className="flex-1 gap-1.5">
              <Link href={s.cta.href} onClick={dismiss}>
                {s.cta.label}
              </Link>
            </Button>
          )}
          {!isLast ? (
            <Button onClick={() => setStep((s) => s + 1)} className="flex-1 gap-1.5">
              Avanti <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={dismiss} className="flex-1">Inizia</Button>
          )}
        </div>

        {step === 0 && (
          <button
            onClick={dismiss}
            className="block mx-auto mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Salta il tour
          </button>
        )}
      </div>
    </div>
  );
}
