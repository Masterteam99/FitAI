"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Sparkles, ChevronRight, Lock } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { readOnboarding, type OnboardingState } from "../onboardingState";
import { copy } from "@/content/copy";

const GOAL_LABELS: Record<string, string> = copy.onboardingStep4.goalLabels;
const LEVEL_LABELS: Record<string, string> = copy.onboardingStep4.levelLabels;

export default function PianoPreviewPage() {
  const router = useRouter();
  // Questa pagina è raggiunta sia da ospiti (quiz pre-registrazione, poi
  // "Salva il mio piano" → registrati) sia da utenti già loggati che hanno
  // rifatto il quiz dal wizard step1-3: per questi ultimi non ha senso
  // rimandarli alla registrazione, vanno dritti a step4 (genera+salva piano).
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [data, setData] = useState<OnboardingState | null>(null);

  useEffect(() => {
    const d = readOnboarding();
    // Se non c'è nulla di compilato, rimanda all'inizio del quiz.
    if (!d.primaryGoal && !d.fitnessLevel) {
      router.replace("/onboarding/step1");
      return;
    }
    setData(d);
  }, [router]);

  if (!data) return null;

  const goal = data.primaryGoal ? (GOAL_LABELS[data.primaryGoal] ?? data.primaryGoal) : "Benessere";
  const level = data.fitnessLevel ? (LEVEL_LABELS[data.fitnessLevel] ?? data.fitnessLevel) : "Base";
  const days = data.weeklyWorkoutDays ?? 3;
  const equip = (data.availableEquipment ?? []).length > 0 ? "in palestra / con attrezzi" : "a corpo libero";

  const included = [
    `Allenamento ${goal.toLowerCase()} · ${days} giorni a settimana`,
    "Correzione della forma con l'AI su ogni esercizio",
    "Piano nutrizionale su misura",
    "Form Score per misurare i tuoi progressi",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <SlideUp>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--organic-green-deep)" }}>
              <Sparkles className="w-4 h-4" /> Il tuo piano è pronto
            </span>
            <h1 className="font-display text-3xl">Ecco il tuo piano</h1>
          </div>
        </SlideUp>

        <FadeIn delay={0.1}>
          <Card className="overflow-hidden">
            <div className="p-6" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
              <p className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--organic-terracotta-soft)" }}>Programma personalizzato</p>
              <p className="font-display text-2xl mt-1">{goal} · {level}</p>
              <p className="text-sm mt-1" style={{ color: "rgba(234,241,248,.72)" }}>{equip} · {days} giorni a settimana</p>
            </div>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {included.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--organic-green)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="space-y-3">
            {isAuthenticated ? (
              <Button size="lg" className="w-full gap-2 glow-energy" onClick={() => router.push("/onboarding/step4")}>
                Genera il mio piano <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <>
                <Link href="/registrati?from=piano">
                  <Button size="lg" className="w-full gap-2 glow-energy">
                    Salva il mio piano <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="w-3.5 h-3.5" /> Ti serve solo la mail — per non perdere il piano.
                </p>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
