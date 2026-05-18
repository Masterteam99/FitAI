"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Zap, Calendar, ChevronRight, CheckCircle, Loader2, Trash2 } from "lucide-react";

interface WorkoutPlan {
  id: string;
  name: string;
  durationWeeks: number;
  workoutsPerWeek: number;
  primaryGoal: string;
  isActive: boolean;
  generatedByAI: boolean;
  days: { id: string; dayNumber: number; name: string; restDay: boolean; exercises: { id: string }[] }[];
}

const GOAL_LABELS: Record<string, string> = {
  WEIGHT_LOSS: "Perdita di peso",
  MUSCLE_GAIN: "Aumento massa",
  STRENGTH: "Forza",
  ENDURANCE: "Resistenza",
  FLEXIBILITY: "Flessibilità",
  GENERAL_FITNESS: "Forma generale",
  SPORT_PERFORMANCE: "Performance sportiva",
};

export default function AllenamentoPage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workout-plans")
      .then((r) => r.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function setActive(id: string) {
    await fetch(`/api/workout-plans/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setActive: true, isActive: true }),
    });
    setPlans((prev) => prev.map((p) => ({ ...p, isActive: p.id === id })));
  }

  async function deletePlan(id: string) {
    await fetch(`/api/workout-plans/${id}`, { method: "DELETE" });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  const activePlan = plans.find((p) => p.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-primary" />
            I miei Allenamenti
          </h1>
          <p className="text-muted-foreground">Gestisci i tuoi piani di allenamento</p>
        </div>
        <Link href="/allenamento/nuovo">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nuovo piano
          </Button>
        </Link>
      </div>

      {plans.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center space-y-4">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-semibold">Nessun piano ancora</p>
              <p className="text-sm text-muted-foreground">Crea un piano manualmente o generane uno con l&apos;AI</p>
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/allenamento/genera-ai">
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  Genera con AI
                </Button>
              </Link>
              <Link href="/allenamento/nuovo">
                <Button variant="outline">Crea manualmente</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {activePlan && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Piano Attivo</h2>
              <PlanCard plan={activePlan} onSetActive={setActive} onDelete={deletePlan} />
            </div>
          )}

          {plans.filter((p) => !p.isActive).length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Altri Piani</h2>
              <div className="space-y-3">
                {plans.filter((p) => !p.isActive).map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onSetActive={setActive} onDelete={deletePlan} />
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <Link href="/allenamento/genera-ai">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Zap className="w-4 h-4 text-primary" />
                Genera nuovo piano con AI
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function PlanCard({ plan, onSetActive, onDelete }: {
  plan: WorkoutPlan;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const totalExercises = plan.days.reduce((acc, d) => acc + d.exercises.length, 0);
  const workoutDays = plan.days.filter((d) => !d.restDay);

  return (
    <Card className={plan.isActive ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{plan.name}</CardTitle>
              {plan.isActive && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Attivo</Badge>}
              {plan.generatedByAI && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="w-3 h-3" />AI
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{GOAL_LABELS[plan.primaryGoal] ?? plan.primaryGoal}</p>
          </div>
          <button
            onClick={() => onDelete(plan.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
            aria-label="Elimina piano"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {plan.durationWeeks} settimane
          </span>
          <span className="flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4" />
            {plan.workoutsPerWeek}x/settimana
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            {totalExercises} esercizi
          </span>
        </div>

        {workoutDays.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {workoutDays.slice(0, 4).map((day) => (
              <span key={day.id} className="text-xs bg-secondary rounded-md px-2 py-1">{day.name}</span>
            ))}
            {workoutDays.length > 4 && (
              <span className="text-xs text-muted-foreground px-1 py-1">+{workoutDays.length - 4} altri</span>
            )}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Link href={`/allenamento/${plan.id}`} className="flex-1 min-w-[120px]">
            <Button size="sm" className="w-full gap-1.5">
              Vai al piano <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          {!plan.isActive && (
            <Button size="sm" variant="outline" onClick={() => onSetActive(plan.id)} className="gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Imposta attivo
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
