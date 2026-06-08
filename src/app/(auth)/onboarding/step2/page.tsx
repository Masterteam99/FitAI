"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { readOnboarding, writeOnboarding } from "../onboardingState";
import { SkipOnboardingButton } from "../SkipOnboardingButton";

const EQUIPMENT_OPTIONS = [
  { value: "NONE", label: "Solo peso corporeo" },
  { value: "DUMBBELLS", label: "Manubri" },
  { value: "BARBELL", label: "Bilanciere" },
  { value: "MACHINE", label: "Macchinari palestra" },
  { value: "CABLES", label: "Cavi/Pulegge" },
  { value: "RESISTANCE_BANDS", label: "Elastici" },
  { value: "PULL_UP_BAR", label: "Sbarra trazioni" },
  { value: "BENCH", label: "Panca" },
  { value: "KETTLEBELL", label: "Kettlebell" },
  { value: "FULL_GYM", label: "Palestra completa" },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<string[]>([]);

  useEffect(() => {
    const s = readOnboarding();
    if (!s.primaryGoal) {
      router.replace("/onboarding/step1");
      return;
    }
    if (s.availableEquipment) setEquipment(s.availableEquipment);
  }, [router]);

  function toggle(val: string) {
    setEquipment((prev) => (prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]));
  }

  function next() {
    if (equipment.length === 0) return;
    writeOnboarding({ availableEquipment: equipment });
    router.push("/onboarding/step3");
  }

  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Attrezzatura disponibile</h1>
          <p className="text-muted-foreground text-sm">Step 2 di 4 — cosa hai a disposizione</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Seleziona tutto quello che puoi usare</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {EQUIPMENT_OPTIONS.map((e) => (
              <button
                key={e.value}
                onClick={() => toggle(e.value)}
                className={`px-3 py-2 rounded-full border text-sm transition-all ${
                  equipment.includes(e.value) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                {e.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/step1")} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Indietro
          </Button>
          <Button size="lg" onClick={next} disabled={equipment.length === 0} className="flex-1 gap-2">
            Continua <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center">
          <SkipOnboardingButton />
        </div>
      </div>
    </div>
  );
}
