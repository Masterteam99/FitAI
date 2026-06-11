import type { FrameAnalysis, JointAngles } from "@/types/analysis";

export type ExercisePhase = "TOP" | "BOTTOM" | "CONCENTRIC" | "ECCENTRIC" | "ISOMETRIC" | "THROUGHOUT";

interface KeyAngleConfig {
  static?: boolean;
  keyAngle?: (a: JointAngles) => number | undefined;
  // Esercizi "pull" in cui la posizione contratta (il top del movimento) coincide
  // con l'angolo MINIMO: con invert, angolo minimo → TOP e angolo massimo → BOTTOM,
  // così le fasi delle spec (nominate per posizione) corrispondono ai frame giusti.
  invert?: boolean;
}

function avg(...vals: (number | undefined)[]): number | undefined {
  const present = vals.filter((v): v is number => typeof v === "number");
  if (present.length === 0) return undefined;
  return present.reduce((s, v) => s + v, 0) / present.length;
}

const kneeKey = (a: JointAngles) => avg(a.leftKnee, a.rightKnee);
const hipKey = (a: JointAngles) => avg(a.leftHip, a.rightHip);
const elbowKey = (a: JointAngles) => avg(a.leftElbow, a.rightElbow);
const shoulderKey = (a: JointAngles) => avg(a.leftShoulder, a.rightShoulder);

export const EXERCISE_PHASE_CONFIG: Record<string, KeyAngleConfig> = {
  // Esercizi statici: una sola fase THROUGHOUT
  "plank": { static: true },
  "plank-laterale": { static: true },

  // Esercizi knee-driven (bottom = ginocchio più flesso = angolo più piccolo)
  "squat": { keyAngle: kneeKey },
  "goblet-squat": { keyAngle: kneeKey },
  "affondi": { keyAngle: kneeKey },
  "bulgarian-split-squat": { keyAngle: kneeKey },
  "leg-press": { keyAngle: kneeKey },
  "front-squat": { keyAngle: kneeKey },
  "overhead-squat": { keyAngle: kneeKey },
  "pistol-squat": { keyAngle: kneeKey },
  "leg-extension": { keyAngle: kneeKey },
  "kettlebell-goblet-squat": { keyAngle: kneeKey },
  "jump-squat": { keyAngle: kneeKey },
  "box-jump": { keyAngle: kneeKey },
  "step-up": { keyAngle: kneeKey },
  "burpee": { keyAngle: kneeKey },
  // Tenuta statica: il range ridotto (<15°) produce ISOMETRIC, come da spec
  "wall-sit": { keyAngle: kneeKey },
  // Leg curl sdraiato: contratto (tallone al gluteo) = angolo minimo = top del movimento
  "leg-curl": { keyAngle: kneeKey, invert: true },

  // Esercizi hip-driven
  "stacco-da-terra": { keyAngle: hipKey },
  "romanian-deadlift": { keyAngle: hipKey },
  "hip-thrust": { keyAngle: hipKey },
  "kettlebell-swing": { keyAngle: hipKey },
  "good-morning": { keyAngle: hipKey },
  "glute-bridge": { keyAngle: hipKey },
  "bird-dog": { keyAngle: hipKey },
  "hip-flexor-stretch": { keyAngle: hipKey },
  "hamstring-stretch": { keyAngle: hipKey },
  // Ginocchio al petto = anca più flessa = angolo minimo = top del movimento
  "mountain-climber": { keyAngle: hipKey, invert: true },

  // Esercizi elbow-driven (spinta: bottom = gomito più flesso)
  "panca-piana": { keyAngle: elbowKey },
  "push-up": { keyAngle: elbowKey },
  "military-press": { keyAngle: elbowKey },
  "incline-bench-press": { keyAngle: elbowKey },
  "dumbbell-bench-press": { keyAngle: elbowKey },
  "dips": { keyAngle: elbowKey },
  "skull-crusher": { keyAngle: elbowKey },
  "arnold-press": { keyAngle: elbowKey },
  // Lat machine: barra al petto = gomito flesso = bottom del movimento (coincide)
  "lat-pulldown": { keyAngle: elbowKey },
  // Tirate: contratto = gomito più flesso = top del movimento → invert
  "tricipiti-cavi": { keyAngle: elbowKey, invert: true },
  "curl-bicipiti": { keyAngle: elbowKey, invert: true },
  "trazioni": { keyAngle: elbowKey, invert: true },
  "rematore-bilanciere": { keyAngle: elbowKey, invert: true },
  "seated-cable-row": { keyAngle: elbowKey, invert: true },
  "dumbbell-row": { keyAngle: elbowKey, invert: true },
  "hammer-curl": { keyAngle: elbowKey, invert: true },
  // Face pull: l'angolo spalla varia poco, il gomito discrimina le fasi
  "face-pull": { keyAngle: elbowKey, invert: true },

  // Esercizi shoulder-driven
  "lateral-raise": { keyAngle: shoulderKey },
  "front-raise": { keyAngle: shoulderKey },

  // Esercizi spine-driven (crunch: contratto = inclinazione minima = top del movimento)
  "crunch": { keyAngle: (a) => a.spineInclination, invert: true },

  // Volutamente NON configurati (le spec usano solo THROUGHOUT, nessuna fase richiesta):
  // chest-fly, calf-raise, russian-twist, cat-cow
};

function smooth(values: (number | undefined)[], window: number): (number | undefined)[] {
  const half = Math.floor(window / 2);
  return values.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = Math.max(0, i - half); j <= Math.min(values.length - 1, i + half); j++) {
      const v = values[j];
      if (typeof v === "number") {
        sum += v;
        count++;
      }
    }
    return count > 0 ? sum / count : undefined;
  });
}

export interface PhaseTimeline {
  framePhases: ExercisePhase[];
  detectedPhases: { phase: string; durationFrames: number }[];
}

export function detectPhases(frames: FrameAnalysis[], exerciseSlug: string): PhaseTimeline {
  if (frames.length === 0) {
    return { framePhases: [], detectedPhases: [] };
  }

  const config = EXERCISE_PHASE_CONFIG[exerciseSlug];

  if (!config || config.static) {
    const framePhases: ExercisePhase[] = frames.map(() => "THROUGHOUT");
    return {
      framePhases,
      detectedPhases: [{ phase: "THROUGHOUT", durationFrames: frames.length }],
    };
  }

  const getKey = config.keyAngle;
  if (!getKey) {
    return {
      framePhases: frames.map(() => "THROUGHOUT"),
      detectedPhases: [{ phase: "THROUGHOUT", durationFrames: frames.length }],
    };
  }

  const raw = frames.map((f) => getKey(f.angles));
  const smoothed = smooth(raw, 5);

  const valid = smoothed.filter((v): v is number => typeof v === "number");
  if (valid.length < 10) {
    return {
      framePhases: frames.map(() => "THROUGHOUT"),
      detectedPhases: [{ phase: "THROUGHOUT", durationFrames: frames.length }],
    };
  }

  const minVal = Math.min(...valid);
  const maxVal = Math.max(...valid);
  const range = maxVal - minVal;

  if (range < 15) {
    const framePhases: ExercisePhase[] = frames.map(() => "ISOMETRIC");
    return {
      framePhases,
      detectedPhases: [{ phase: "ISOMETRIC", durationFrames: frames.length }],
    };
  }

  const bottomThreshold = minVal + range * 0.18;
  const topThreshold = maxVal - range * 0.18;
  const invert = !!config.invert;

  const framePhases: ExercisePhase[] = smoothed.map((v, i) => {
    if (typeof v !== "number") return "THROUGHOUT";
    if (v <= bottomThreshold) return invert ? "TOP" : "BOTTOM";
    if (v >= topThreshold) return invert ? "BOTTOM" : "TOP";
    const prev = smoothed[Math.max(0, i - 3)];
    const next = smoothed[Math.min(smoothed.length - 1, i + 3)];
    if (typeof prev === "number" && typeof next === "number") {
      // Angolo che diminuisce = discesa (eccentrica); per i pull invertiti
      // l'angolo che diminuisce è la contrazione (concentrica).
      if (next < prev) return invert ? "CONCENTRIC" : "ECCENTRIC";
      if (next > prev) return invert ? "ECCENTRIC" : "CONCENTRIC";
    }
    return "THROUGHOUT";
  });

  // Persistence ≥5 frames: assorbe rumore di fase isolato
  const persisted: ExercisePhase[] = [...framePhases];
  for (let i = 0; i < persisted.length; i++) {
    const phase = persisted[i];
    let runEnd = i;
    while (runEnd + 1 < persisted.length && persisted[runEnd + 1] === phase) runEnd++;
    const runLength = runEnd - i + 1;
    if (runLength < 5 && i > 0) {
      const fillWith = persisted[i - 1];
      for (let j = i; j <= runEnd; j++) persisted[j] = fillWith;
    }
    i = runEnd;
  }

  const detectedPhases: { phase: string; durationFrames: number }[] = [];
  let currentPhase = persisted[0];
  let currentLen = 1;
  for (let i = 1; i < persisted.length; i++) {
    if (persisted[i] === currentPhase) {
      currentLen++;
    } else {
      detectedPhases.push({ phase: currentPhase, durationFrames: currentLen });
      currentPhase = persisted[i];
      currentLen = 1;
    }
  }
  detectedPhases.push({ phase: currentPhase, durationFrames: currentLen });

  return { framePhases: persisted, detectedPhases };
}

export function findRepresentativeFrames(timeline: PhaseTimeline, frames: FrameAnalysis[]): { bottom: number[]; top: number[] } {
  const bottoms: number[] = [];
  const tops: number[] = [];
  let inBottom = false;
  let inTop = false;
  let runStart = 0;
  for (let i = 0; i < timeline.framePhases.length; i++) {
    const p = timeline.framePhases[i];
    if (p === "BOTTOM" && !inBottom) {
      inBottom = true;
      runStart = i;
    } else if (p !== "BOTTOM" && inBottom) {
      bottoms.push(Math.floor((runStart + i - 1) / 2));
      inBottom = false;
    }
    if (p === "TOP" && !inTop) {
      inTop = true;
      runStart = i;
    } else if (p !== "TOP" && inTop) {
      tops.push(Math.floor((runStart + i - 1) / 2));
      inTop = false;
    }
  }
  if (inBottom) bottoms.push(Math.floor((runStart + frames.length - 1) / 2));
  if (inTop) tops.push(Math.floor((runStart + frames.length - 1) / 2));
  return { bottom: bottoms, top: tops };
}
