"use client";

import { useState } from "react";
import { AnatomyFront } from "./AnatomyFront";
import { AnatomyBack } from "./AnatomyBack";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "volume" | "recovery" | "balance";
type View = "front" | "back" | "both";

type VolumeData = Record<string, number>; // 0-1 normalized
type RecoveryData = Record<string, { hoursSinceLast: number | null; recoveryPct: number }>;
type ImbalanceData = Array<{ muscle: string; deficitPct: number; message: string }>;

type Props =
  | { mode: "volume"; data: VolumeData; view?: View; className?: string; showLegend?: boolean; showToggle?: boolean }
  | { mode: "recovery"; data: RecoveryData; view?: View; className?: string; showLegend?: boolean; showToggle?: boolean }
  | { mode: "balance"; data: ImbalanceData; view?: View; className?: string; showLegend?: boolean; showToggle?: boolean };

function volumeColorClass(value: number): string {
  if (value <= 0.05) return "fill-energy-cold/30";
  if (value <= 0.3) return "fill-energy-cool/60";
  if (value <= 0.6) return "fill-energy-cool";
  if (value <= 0.85) return "fill-energy-warm";
  return "fill-energy-hot";
}

function recoveryColorClass(pct: number): string {
  if (pct < 25) return "fill-energy-hot";
  if (pct < 50) return "fill-energy-warm";
  if (pct < 75) return "fill-energy-cool/70";
  return "fill-energy-cool";
}

function balanceClass(isDeficit: boolean): string {
  return isDeficit ? "fill-energy-hot/80 animate-pulse" : "fill-muted-foreground/15";
}

export function BodyMap(props: Props) {
  const { mode, data, className, showLegend = true, showToggle = true } = props as Props & { data: VolumeData | RecoveryData | ImbalanceData };
  const initialView: View = props.view ?? "front";
  const [view, setView] = useState<View>(initialView);

  const muscleClasses = computeMuscleClasses(mode, data);

  return (
    <div className={cn("w-full space-y-3", className)}>
      {showToggle && (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={view === "front" ? "default" : "outline"}
            onClick={() => setView("front")}
          >
            Fronte
          </Button>
          <Button
            size="sm"
            variant={view === "back" ? "default" : "outline"}
            onClick={() => setView("back")}
          >
            Retro
          </Button>
          <Button
            size="sm"
            variant={view === "both" ? "default" : "outline"}
            onClick={() => setView("both")}
          >
            Entrambi
          </Button>
        </div>
      )}

      <div
        className={cn(
          "grid gap-4",
          view === "both" ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {(view === "front" || view === "both") && (
          <div className="flex justify-center max-w-[260px] mx-auto">
            <AnatomyFront muscleClasses={muscleClasses} />
          </div>
        )}
        {(view === "back" || view === "both") && (
          <div className="flex justify-center max-w-[260px] mx-auto">
            <AnatomyBack muscleClasses={muscleClasses} />
          </div>
        )}
      </div>

      {showLegend && <Legend mode={mode} />}
    </div>
  );
}

function computeMuscleClasses(mode: Mode, data: VolumeData | RecoveryData | ImbalanceData): Record<string, string> {
  const out: Record<string, string> = {};
  if (mode === "volume") {
    const d = data as VolumeData;
    for (const [muscle, value] of Object.entries(d)) {
      out[muscle] = volumeColorClass(value);
    }
  } else if (mode === "recovery") {
    const d = data as RecoveryData;
    for (const [muscle, info] of Object.entries(d)) {
      out[muscle] = recoveryColorClass(info.recoveryPct);
    }
  } else {
    const d = data as ImbalanceData;
    const deficitSet = new Set(d.filter((i) => i.deficitPct > 50).map((i) => i.muscle));
    const allMuscles = ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES"];
    for (const m of allMuscles) out[m] = balanceClass(deficitSet.has(m));
  }
  return out;
}

function Legend({ mode }: { mode: Mode }) {
  if (mode === "volume") {
    return (
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Volume 30g:</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-cold/30" />
          poco
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-cool" />
          medio
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-warm" />
          alto
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-hot" />
          molto
        </span>
      </div>
    );
  }
  if (mode === "recovery") {
    return (
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Recovery:</span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-hot" />
          affaticato
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-warm" />
          in recupero
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-energy-cool" />
          pronto
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <span>Squilibri:</span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-sm bg-energy-hot/80" />
        sotto-allenato
      </span>
      <span className="flex items-center gap-1">
        <span className="w-3 h-3 rounded-sm bg-muted-foreground/15" />
        ok
      </span>
    </div>
  );
}
