"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, CheckCircle, Zap } from "lucide-react";
import { readOnboarding, writeOnboarding } from "../onboardingState";
import { SkipOnboardingButton } from "../SkipOnboardingButton";
import { OnboardingProgress } from "../OnboardingProgress";
import { copy } from "@/content/copy";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

const GOAL_EMOJI = ["🔥", "💪", "🏋️", "🏃", "🧘", "⚡"];
const GOALS = copy.onboardingStep1.goals.map((g, i) => ({ ...g, emoji: GOAL_EMOJI[i] }));

const LEVELS = copy.onboardingStep1.levels;

export default function OnboardingStep1() {
  const c = useCopy().onboardingStep1;
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");

  useEffect(() => {
    const s = readOnboarding();
    if (s.primaryGoal) setGoal(s.primaryGoal);
    if (s.fitnessLevel) setLevel(s.fitnessLevel);
  }, []);

  function next() {
    if (!goal || !level) return;
    writeOnboarding({ primaryGoal: goal, fitnessLevel: level });
    router.push("/onboarding/step2");
  }

  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <OnboardingProgress current={1} />
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold"><EditableText path="onboardingStep1.title">{c.title}</EditableText></h1>
          <p className="text-muted-foreground text-sm"><EditableText path="onboardingStep1.stepLabel">{c.stepLabel}</EditableText></p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base"><EditableText path="onboardingStep1.goalsTitle">{c.goalsTitle}</EditableText></CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className={`p-3 rounded-xl border text-left transition-all text-sm ${
                  goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                <span className="text-xl block mb-1">{g.emoji}</span>
                {g.label}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base"><EditableText path="onboardingStep1.levelsTitle">{c.levelsTitle}</EditableText></CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                  level === l.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  <p className={`font-medium text-sm ${level === l.value ? "text-primary" : ""}`}>{l.label}</p>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
                {level === l.value && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Button size="lg" onClick={next} disabled={!goal || !level} className="w-full gap-2">
          <EditableText path="onboardingStep1.continue">{c.continue}</EditableText> <ChevronRight className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <SkipOnboardingButton />
        </div>
      </div>
    </div>
  );
}
