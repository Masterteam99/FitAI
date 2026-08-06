import type { FrameAnalysis, L1Result, JointAngles } from "@/types/analysis";
import type { ExercisePhase, PhaseTimeline } from "./phaseDetector";

interface PhaseTriggerData {
  condition: string;
  severity: string;
  feedback: string;
  injuryRisk: boolean;
}

interface MovementPhaseData {
  phase: ExercisePhase | string;
  minAngle: number;
  maxAngle: number;
  triggers: PhaseTriggerData[];
}

interface MovementData {
  joint: string;
  movementType: string;
  phases: MovementPhaseData[];
}

export interface BiomechanicalSpecData {
  movements: MovementData[];
}

const SEVERITY_WEIGHT: Record<string, number> = {
  WARNING: 1,
  ERROR: 3,
  CRITICAL: 10,
};

// Persistenza minima: una violazione conta solo se sostenuta per almeno questa
// durata in frame CONSECUTIVI (misurata dai timestamp, in ms). ~200ms ≈ 5-6 frame
// a 24-30fps. Calibrazione "bilanciata": cattura gli errori reali, scarta il jitter.
const MIN_VIOLATION_MS = 200;
// Fallback solo se i timestamp sono degeneri/non monotoni (dati anomali):
// si torna a un conteggio in frame consecutivi.
const MIN_VIOLATION_FRAMES_FALLBACK = 5;

interface ViolationState {
  trigger: PhaseTriggerData;
  count: number; // frame totali in violazione (per persistence/penalty)
  phaseFramesTotal: number;
  lastFrameIndex: number; // ultimo indice frame che ha violato questa chiave
  runStartTs: number; // timestamp inizio run consecutiva corrente
  runLastTs: number; // timestamp ultimo frame della run corrente
  maxRunMs: number; // run consecutiva più lunga vista (ms)
  maxRunFrames: number; // run consecutiva più lunga vista (frame) — per fallback
  curRunFrames: number; // lunghezza run corrente in frame
}

export const SPEC_JOINTS = [
  "left_knee", "right_knee", "left_elbow", "right_elbow",
  "left_shoulder", "right_shoulder", "left_hip", "right_hip", "spine",
] as const;

export function jointAngleFor(joint: string, angles: JointAngles): number | undefined {
  switch (joint) {
    case "left_knee": return angles.leftKnee;
    case "right_knee": return angles.rightKnee;
    case "left_elbow": return angles.leftElbow;
    case "right_elbow": return angles.rightElbow;
    case "left_shoulder": return angles.leftShoulder;
    case "right_shoulder": return angles.rightShoulder;
    case "left_hip": return angles.leftHip;
    case "right_hip": return angles.rightHip;
    case "spine": return angles.spineInclination;
    default: return undefined;
  }
}

function violationFor(angle: number, p: MovementPhaseData): PhaseTriggerData | null {
  for (const t of p.triggers) {
    const c = t.condition.toUpperCase();
    if (c === "BELOW_MIN" && angle < p.minAngle) return t;
    if (c === "ABOVE_MAX" && angle > p.maxAngle) return t;
    if (c === "OUT_OF_RANGE" && (angle < p.minAngle || angle > p.maxAngle)) return t;
  }
  return null;
}

export function evaluateExerciseSpec(
  frames: FrameAnalysis[],
  spec: BiomechanicalSpecData,
  timeline: PhaseTimeline
): L1Result {
  const violations = new Map<string, ViolationState>();
  const phaseFrameCount: Record<string, number> = {};

  timeline.framePhases.forEach((p) => {
    phaseFrameCount[p] = (phaseFrameCount[p] || 0) + 1;
  });

  for (let i = 0; i < frames.length; i++) {
    const phase = timeline.framePhases[i] ?? "THROUGHOUT";
    const angles = frames[i].angles;
    const ts = frames[i].timestamp;

    for (const movement of spec.movements) {
      const angle = jointAngleFor(movement.joint, angles);
      if (typeof angle !== "number") continue;

      for (const phaseSpec of movement.phases) {
        const phaseName = phaseSpec.phase.toString().toUpperCase();
        const matches = phaseName === phase || phaseName === "THROUGHOUT";
        if (!matches) continue;

        const trigger = violationFor(angle, phaseSpec);
        if (trigger) {
          const key = `${movement.joint}|${phaseSpec.phase}|${trigger.condition}|${trigger.feedback}`;
          const existing = violations.get(key);
          const total = phaseFrameCount[phaseName] || phaseFrameCount[phase] || frames.length;
          if (!existing) {
            violations.set(key, {
              trigger,
              count: 1,
              phaseFramesTotal: total,
              lastFrameIndex: i,
              runStartTs: ts,
              runLastTs: ts,
              maxRunMs: 0,
              maxRunFrames: 1,
              curRunFrames: 1,
            });
          } else {
            existing.count++;
            if (existing.lastFrameIndex === i - 1) {
              // run consecutiva: estendi
              existing.runLastTs = ts;
              existing.curRunFrames++;
            } else {
              // gap: chiudi la run precedente, aprine una nuova
              existing.maxRunMs = Math.max(existing.maxRunMs, existing.runLastTs - existing.runStartTs);
              existing.maxRunFrames = Math.max(existing.maxRunFrames, existing.curRunFrames);
              existing.runStartTs = ts;
              existing.runLastTs = ts;
              existing.curRunFrames = 1;
            }
            existing.lastFrameIndex = i;
          }
        }
      }
    }
  }

  // Finalizza le run aperte.
  for (const v of violations.values()) {
    v.maxRunMs = Math.max(v.maxRunMs, v.runLastTs - v.runStartTs);
    v.maxRunFrames = Math.max(v.maxRunFrames, v.curRunFrames);
  }

  // Timestamp utilizzabili? (span > 0). Altrimenti fallback in frame consecutivi.
  const tsSpan = frames.length > 1
    ? frames[frames.length - 1].timestamp - frames[0].timestamp
    : 0;
  const useFrameFallback = tsSpan <= 0;

  const triggeredFeedback: L1Result["triggeredFeedback"] = [];
  let penaltySum = 0;
  let evaluatedMovements = 0;

  for (const movement of spec.movements) {
    for (const _phase of movement.phases) {
      void _phase;
      evaluatedMovements++;
    }
  }
  if (evaluatedMovements === 0) evaluatedMovements = 1;

  for (const v of violations.values()) {
    const passes = useFrameFallback
      ? v.maxRunFrames >= MIN_VIOLATION_FRAMES_FALLBACK
      : v.maxRunMs >= MIN_VIOLATION_MS;
    if (!passes) continue;

    const persistence = Math.min(1, v.count / Math.max(v.phaseFramesTotal, 1));
    const sev = v.trigger.severity.toUpperCase();
    const weight = SEVERITY_WEIGHT[sev] ?? 1;
    penaltySum += weight * persistence;
    triggeredFeedback.push({
      feedback: v.trigger.feedback,
      severity: (sev === "WARNING" || sev === "ERROR" || sev === "CRITICAL") ? sev : "WARNING",
      injuryRisk: !!v.trigger.injuryRisk,
    });
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - (penaltySum / evaluatedMovements) * 10)));

  // Sample angles per debug/UI: max 30 frame distribuiti
  const stride = Math.max(1, Math.floor(frames.length / 30));
  const rawAnglesSampled = frames
    .filter((_, i) => i % stride === 0)
    .slice(0, 30)
    .map((f) => ({ timestamp: f.timestamp, angles: f.angles }));

  return {
    score,
    triggeredFeedback,
    detectedPhases: timeline.detectedPhases,
    rawAnglesSampled,
  };
}
