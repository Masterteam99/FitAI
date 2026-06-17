"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { readOnboarding, writeOnboarding } from "../onboardingState";
import { SkipOnboardingButton } from "../SkipOnboardingButton";
import { OnboardingProgress } from "../OnboardingProgress";
import { copy } from "@/content/copy";

const GENDERS = copy.onboardingStep3.genders;

const DAYS_OPTIONS = [2, 3, 4, 5, 6];
const DIET_OPTIONS = copy.onboardingStep3.dietOptions;
const SPORT_OPTIONS = copy.onboardingStep3.sportOptions;

export default function OnboardingStep3() {
  const router = useRouter();
  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [gender, setGender] = useState("");
  const [days, setDays] = useState(3);
  const [dietType, setDietType] = useState<string>(DIET_OPTIONS[0]);
  const [pastInjuries, setPastInjuries] = useState("");
  const [pastSports, setPastSports] = useState<string[]>([]);

  useEffect(() => {
    const s = readOnboarding();
    if (!s.availableEquipment) {
      router.replace("/onboarding/step2");
      return;
    }
    if (s.age) setAge(String(s.age));
    if (s.weightKg) setWeightKg(String(s.weightKg));
    if (s.heightCm) setHeightCm(String(s.heightCm));
    if (s.gender) setGender(s.gender);
    if (s.weeklyWorkoutDays) setDays(s.weeklyWorkoutDays);
    if (s.dietType) setDietType(s.dietType);
    if (s.pastInjuries && s.pastInjuries.length > 0) setPastInjuries(s.pastInjuries.join(", "));
    if (s.pastSports) setPastSports(s.pastSports);
  }, [router]);

  const ageNum = parseInt(age);
  const weightNum = parseFloat(weightKg);
  const heightNum = parseFloat(heightCm);
  const valid =
    ageNum >= 12 && ageNum <= 100 &&
    weightNum >= 30 && weightNum <= 300 &&
    heightNum >= 100 && heightNum <= 250 &&
    gender;

  function next() {
    if (!valid) return;
    writeOnboarding({
      age: ageNum,
      weightKg: weightNum,
      heightCm: heightNum,
      gender,
      weeklyWorkoutDays: days,
      dietType,
      pastInjuries: pastInjuries.trim() ? pastInjuries.split(",").map(i => i.trim()) : [],
      pastSports,
    });
    router.push("/onboarding/step4");
  }

  function toggleSport(s: string) {
    if (s === SPORT_OPTIONS[0]) {
      setPastSports([SPORT_OPTIONS[0]]);
      return;
    }
    setPastSports(prev => {
      const withoutNessuno = prev.filter(x => x !== SPORT_OPTIONS[0]);
      if (withoutNessuno.includes(s)) {
        return withoutNessuno.filter(x => x !== s);
      }
      return [...withoutNessuno, s];
    });
  }

  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <OnboardingProgress current={3} />
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <User className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{copy.onboardingStep3.title}</h1>
          <p className="text-muted-foreground text-sm">{copy.onboardingStep3.stepLabel}</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{copy.onboardingStep3.physicalDataTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{copy.onboardingStep3.ageLabel}</label>
                <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder={copy.onboardingStep3.agePlaceholder} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{copy.onboardingStep3.weightLabel}</label>
                <Input type="number" inputMode="decimal" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder={copy.onboardingStep3.weightPlaceholder} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{copy.onboardingStep3.heightLabel}</label>
                <Input type="number" inputMode="numeric" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder={copy.onboardingStep3.heightPlaceholder} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{copy.onboardingStep3.genderLabel}</label>
              <div className="flex gap-2">
                {GENDERS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm transition-all ${
                      gender === g.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{copy.onboardingStep3.daysTitle}</CardTitle></CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {DAYS_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`w-12 h-12 rounded-xl border font-semibold transition-all ${
                  days === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                }`}
              >
                {d}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{copy.onboardingStep3.lifestyleTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{copy.onboardingStep3.dietLabel}</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={dietType}
                onChange={(e) => setDietType(e.target.value)}
              >
                {DIET_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{copy.onboardingStep3.injuriesLabel}</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={pastInjuries}
                onChange={(e) => setPastInjuries(e.target.value)}
                placeholder={copy.onboardingStep3.injuriesPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{copy.onboardingStep3.sportsLabel}</label>
              <div className="flex flex-wrap gap-2">
                {SPORT_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSport(s)}
                    className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                      pastSports.includes(s) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/step2")} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {copy.onboardingStep3.back}
          </Button>
          <Button size="lg" onClick={next} disabled={!valid} className="flex-1 gap-2">
            {copy.onboardingStep3.continue} <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center">
          <SkipOnboardingButton />
        </div>
      </div>
    </div>
  );
}
