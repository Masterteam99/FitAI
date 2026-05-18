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

function jointAngleFor(joint: string, angles: JointAngles): number | undefined {
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
  const violationCounts = new Map<string, { trigger: PhaseTriggerData; count: number; phaseFramesTotal: number }>();
  const phaseFrameCount: Record<string, number> = {};

  timeline.framePhases.forEach((p) => {
    phaseFrameCount[p] = (phaseFrameCount[p] || 0) + 1;
  });

  for (let i = 0; i < frames.length; i++) {
    const phase = timeline.framePhases[i] ?? "THROUGHOUT";
    const angles = frames[i].angles;

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
          const existing = violationCounts.get(key);
          const total = phaseFrameCount[phaseName] || phaseFrameCount[phase] || frames.length;
          if (existing) {
            existing.count++;
          } else {
            violationCounts.set(key, { trigger, count: 1, phaseFramesTotal: total });
          }
        }
      }
    }
  }

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

  for (const { trigger, count, phaseFramesTotal } of violationCounts.values()) {
    // Persistenza minima: ignora violazioni < 5 frame consecutivi non garantiti, ma usiamo count cumulativo
    if (count < 5) continue;
    const persistence = Math.min(1, count / Math.max(phaseFramesTotal, 1));
    const sev = trigger.severity.toUpperCase();
    const weight = SEVERITY_WEIGHT[sev] ?? 1;
    penaltySum += weight * persistence;
    triggeredFeedback.push({
      feedback: trigger.feedback,
      severity: (sev === "WARNING" || sev === "ERROR" || sev === "CRITICAL") ? sev : "WARNING",
      injuryRisk: !!trigger.injuryRisk,
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
