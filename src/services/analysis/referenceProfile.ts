import type { FrameAnalysis, ReferenceProfile, ReferenceMovement } from "@/types/analysis";
import type { PhaseTimeline } from "@/services/biomechanical/phaseDetector";
import { SPEC_JOINTS, jointAngleFor } from "@/services/biomechanical/specEvaluator";

export const REFERENCE_PROFILE_VERSION = 1;
export const DEFAULT_TOLERANCE_DEG = 15;

interface Acc {
  joint: string;
  phase: string;
  min: number;
  max: number;
  sum: number;
  count: number;
}

/**
 * Riduce un frameHistory (angoli per frame) + timeline delle fasi a un profilo
 * biomeccanico compatto: min/max/media di ogni giunto in ogni fase.
 * Usato SIA per il video PT SIA per l'esecuzione utente → simmetria per costruzione.
 * Funzione pura: nessuna dipendenza da DOM/rete/React.
 */
export function buildReferenceProfile(
  frames: FrameAnalysis[],
  timeline: PhaseTimeline,
  opts?: { fps?: number }
): ReferenceProfile {
  const byKey = new Map<string, Acc>();

  for (let i = 0; i < frames.length; i++) {
    const phase = timeline.framePhases[i] ?? "THROUGHOUT";
    const angles = frames[i].angles;
    for (const joint of SPEC_JOINTS) {
      const a = jointAngleFor(joint, angles);
      if (typeof a !== "number" || Number.isNaN(a)) continue;
      const key = `${joint}|${phase}`;
      const cur = byKey.get(key);
      if (!cur) {
        byKey.set(key, { joint, phase, min: a, max: a, sum: a, count: 1 });
      } else {
        cur.min = Math.min(cur.min, a);
        cur.max = Math.max(cur.max, a);
        cur.sum += a;
        cur.count++;
      }
    }
  }

  const movements: ReferenceMovement[] = Array.from(byKey.values()).map((v) => ({
    joint: v.joint,
    phase: v.phase,
    minAngle: Math.round(v.min),
    maxAngle: Math.round(v.max),
    meanAngle: Math.round(v.sum / v.count),
    sampleCount: v.count,
  }));

  const detectedReps = timeline.detectedPhases.filter((p) => p.phase === "BOTTOM").length;

  return {
    movements,
    meta: { fps: opts?.fps ?? 0, totalFrames: frames.length, detectedReps },
  };
}

const JOINT_LABEL_IT: Record<string, string> = {
  left_knee: "ginocchio sx",
  right_knee: "ginocchio dx",
  left_elbow: "gomito sx",
  right_elbow: "gomito dx",
  left_shoulder: "spalla sx",
  right_shoulder: "spalla dx",
  left_hip: "anca sx",
  right_hip: "anca dx",
  spine: "schiena",
};

/**
 * Confronta il profilo dell'utente col profilo del PT.
 * Per ogni coppia (giunto × fase) comune misura la deviazione dell'angolo medio,
 * normalizzata sulla tolleranza. Restituisce un punteggio 0-100 e le differenze
 * chiave (deviazioni oltre tolleranza, ordinate decrescenti). Funzione pura.
 */
export function compareToReference(
  user: ReferenceProfile,
  pt: ReferenceProfile,
  opts?: { toleranceDeg?: number }
): { numericScore: number; keyDifferences: { aspect: string; user: string; pro: string }[] } {
  const tol = opts?.toleranceDeg ?? DEFAULT_TOLERANCE_DEG;
  const ptByKey = new Map(pt.movements.map((m) => [`${m.joint}|${m.phase}`, m]));

  const adherences: number[] = [];
  const diffs: { aspect: string; user: string; pro: string; dev: number }[] = [];

  for (const um of user.movements) {
    const pm = ptByKey.get(`${um.joint}|${um.phase}`);
    if (!pm) continue;
    const dev = Math.abs(um.meanAngle - pm.meanAngle);
    const adherence = Math.max(0, 1 - dev / (tol * 2)); // 0 quando dev = 2× tolleranza
    adherences.push(adherence);
    if (dev > tol) {
      const label = JOINT_LABEL_IT[um.joint] ?? um.joint;
      diffs.push({
        aspect: `${label} — ${um.phase}`,
        user: `${um.meanAngle}°`,
        pro: `${pm.meanAngle}°`,
        dev,
      });
    }
  }

  const numericScore =
    adherences.length === 0
      ? 0
      : Math.round((adherences.reduce((s, a) => s + a, 0) / adherences.length) * 100);

  const keyDifferences = diffs
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 5)
    .map(({ aspect, user, pro }) => ({ aspect, user, pro }));

  return { numericScore, keyDifferences };
}
