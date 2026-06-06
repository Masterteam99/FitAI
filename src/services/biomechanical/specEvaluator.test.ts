import { describe, it, expect } from "vitest";
import { evaluateExerciseSpec, type BiomechanicalSpecData } from "./specEvaluator";
import type { PhaseTimeline } from "./phaseDetector";
import type { FrameAnalysis } from "@/types/analysis";

// Spec reale: BiomechanicalSpecData = { movements: MovementData[] }
// MovementData = { joint, movementType, phases: [{ phase, minAngle, maxAngle, triggers }] }
// PhaseTriggerData = { condition, severity, feedback, injuryRisk }
// joint "left_knee" -> angles.leftKnee (vedi jointAngleFor in specEvaluator.ts)
const spec: BiomechanicalSpecData = {
  movements: [
    {
      joint: "left_knee",
      movementType: "flexion",
      phases: [
        {
          phase: "THROUGHOUT", // matcha ogni frame (vedi specEvaluator.ts riga 81)
          minAngle: 90,
          maxAngle: 180,
          triggers: [
            {
              condition: "BELOW_MIN",
              severity: "ERROR",
              feedback: "Ginocchia troppo flesse",
              injuryRisk: false,
            },
          ],
        },
      ],
    },
  ],
};

function framesWithKnee(n: number, knee: number): FrameAnalysis[] {
  return Array.from({ length: n }, (_, i) => ({
    timestamp: i,
    keypoints: [],
    angles: { leftKnee: knee },
  }));
}

function throughoutTimeline(n: number): PhaseTimeline {
  return {
    framePhases: Array.from({ length: n }, () => "THROUGHOUT" as const),
    detectedPhases: [{ phase: "THROUGHOUT", durationFrames: n }],
  };
}

describe("evaluateExerciseSpec", () => {
  it("esecuzione pulita (entro range) => score 100, nessun trigger", () => {
    // knee 120 e' tra minAngle 90 e maxAngle 180 -> nessuna violazione
    const frames = framesWithKnee(10, 120);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(10));
    expect(r.score).toBe(100);
    expect(r.triggeredFeedback).toHaveLength(0);
  });

  it("violazione persistente BELOW_MIN ERROR => score 70 con trigger", () => {
    // 10 frame con knee 70 < minAngle 90 -> BELOW_MIN su tutti i frame.
    // Aritmetica del motore reale (specEvaluator.ts):
    //   count = 10 (>= 5, quindi non ignorata)
    //   phaseFramesTotal = 10 (framePhases tutti THROUGHOUT)
    //   persistence = min(1, 10/10) = 1
    //   weight ERROR = 3
    //   penaltySum = 3 * 1 = 3
    //   evaluatedMovements = 1 (1 movimento x 1 fase)
    //   score = round(100 - (3/1)*10) = round(70) = 70
    const frames = framesWithKnee(10, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(10));
    expect(r.score).toBe(70);
    expect(r.triggeredFeedback).toHaveLength(1);
    expect(r.triggeredFeedback[0].severity).toBe("ERROR");
    expect(r.triggeredFeedback[0].injuryRisk).toBe(false);
    expect(r.triggeredFeedback[0].feedback).toBe("Ginocchia troppo flesse");
  });

  it("violazione sotto i 5 frame viene ignorata (rumore)", () => {
    // 4 frame violati -> count = 4 < 5 -> filtro rumore (specEvaluator.ts riga 113)
    const frames = framesWithKnee(4, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(4));
    expect(r.triggeredFeedback).toHaveLength(0);
    expect(r.score).toBe(100);
  });
});
