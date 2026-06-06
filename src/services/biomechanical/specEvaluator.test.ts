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

// ~33ms/frame => ~30fps, timestamp realistici (il gate persistenza è in ms).
const FRAME_MS = 33;

function framesWithKnee(n: number, knee: number): FrameAnalysis[] {
  return Array.from({ length: n }, (_, i) => ({
    timestamp: i * FRAME_MS,
    keypoints: [],
    angles: { leftKnee: knee },
  }));
}

// Frame con angolo del ginocchio scelto per indice (per costruire violazioni
// sparse o a blocchi). violatesAt(i) === true => knee fuori range (70), altrimenti 120.
function framesWithKneePattern(n: number, violatesAt: (i: number) => boolean): FrameAnalysis[] {
  return Array.from({ length: n }, (_, i) => ({
    timestamp: i * FRAME_MS,
    keypoints: [],
    angles: { leftKnee: violatesAt(i) ? 70 : 120 },
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

  it("violazione troppo breve viene ignorata (rumore)", () => {
    // 4 frame violati consecutivi -> run = 3*33 = 99ms < MIN_VIOLATION_MS (200)
    // -> sotto soglia di persistenza, filtrata come rumore.
    const frames = framesWithKnee(4, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(4));
    expect(r.triggeredFeedback).toHaveLength(0);
    expect(r.score).toBe(100);
  });

  it("violazioni sparse (mai consecutive) non triggano nonostante count cumulativo >= 5", () => {
    // 12 frame, viola solo ai pari (0,2,4,6,8,10 = 6 frame fuori range).
    // Cumulativo = 6 (avrebbe triggato con la vecchia logica count >= 5),
    // ma ogni run consecutiva = 1 frame = 0ms < 200 -> nessun trigger.
    const frames = framesWithKneePattern(12, (i) => i % 2 === 0);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(12));
    expect(r.triggeredFeedback).toHaveLength(0);
    expect(r.score).toBe(100);
  });

  it("run consecutiva >= 200ms => trigger presente", () => {
    // 8 frame consecutivi in violazione -> run = 7*33 = 231ms >= 200 -> trigger.
    const frames = framesWithKnee(8, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(8));
    expect(r.triggeredFeedback).toHaveLength(1);
    expect(r.triggeredFeedback[0].severity).toBe("ERROR");
  });

  it("run consecutiva < 200ms => nessun trigger (confine soglia)", () => {
    // 6 frame consecutivi in violazione -> run = 5*33 = 165ms < 200 -> soppresso.
    const frames = framesWithKnee(6, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(6));
    expect(r.triggeredFeedback).toHaveLength(0);
    expect(r.score).toBe(100);
  });

  it("errore ripetuto su blocchi non consecutivi viene comunque catturato", () => {
    // 20 frame: due blocchi di violazione da 8 (0-7 e 12-19) separati da un gap
    // in range (8-11). Almeno una run = 7*33 = 231ms >= 200 -> trigger presente.
    const frames = framesWithKneePattern(20, (i) => i < 8 || i >= 12);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(20));
    expect(r.triggeredFeedback).toHaveLength(1);
    expect(r.triggeredFeedback[0].feedback).toBe("Ginocchia troppo flesse");
  });
});
