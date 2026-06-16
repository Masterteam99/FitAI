"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnatomyFront } from "@/components/visualizations/BodyMap/AnatomyFront";
import { AnatomyBack } from "@/components/visualizations/BodyMap/AnatomyBack";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  muscleClassesFromVolume,
  muscleClassesFromRecovery,
  deficitMuscles,
  MUSCLE_KEYS,
  type VolumeData,
  type RecoveryData,
  type ImbalanceData,
} from "./heat/heatScale";

type View = "front" | "back" | "both";

type Props =
  | { mode: "volume"; data: VolumeData; view?: View; className?: string; showToggle?: boolean }
  | { mode: "recovery"; data: RecoveryData; view?: View; className?: string; showToggle?: boolean }
  | { mode: "balance"; data: ImbalanceData; view?: View; className?: string; showToggle?: boolean };

function classesFor(props: Props): Record<string, string> {
  if (props.mode === "volume") return muscleClassesFromVolume(props.data);
  if (props.mode === "recovery") return muscleClassesFromRecovery(props.data);
  const deficit = new Set(deficitMuscles(props.data));
  const out: Record<string, string> = {};
  for (const m of MUSCLE_KEYS) {
    out[m] = deficit.has(m) ? "fill-energy-hot/80 wow-pulse" : "fill-muted-foreground/15";
  }
  return out;
}

export function AdaptiveBodyMap(props: Props) {
  const reduced = useReducedMotion();
  const initialView: View = props.view ?? "front";
  const [view, setView] = useState<View>(initialView);
  const muscleClasses = classesFor(props);
  const showToggle = props.showToggle ?? true;

  return (
    <motion.div
      className={cn("w-full space-y-3", props.className)}
      initial={reduced ? false : { opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {showToggle && (
        <div className="flex gap-1">
          {(["front", "back", "both"] as const).map((v) => (
            <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>
              {v === "front" ? "Fronte" : v === "back" ? "Retro" : "Entrambi"}
            </Button>
          ))}
        </div>
      )}
      <div className={cn("grid gap-4", view === "both" ? "grid-cols-2" : "grid-cols-1")}>
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
    </motion.div>
  );
}
