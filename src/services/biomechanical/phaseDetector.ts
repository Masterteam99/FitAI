import type { FrameAnalysis, JointAngles } from "@/types/analysis";

export type ExercisePhase = "TOP" | "BOTTOM" | "CONCENTRIC" | "ECCENTRIC" | "ISOMETRIC" | "THROUGHOUT";

interface KeyAngleConfig {
  static?: boolean;
  keyAngle?: (a: JointAngles) => number | undefined;
}

function avg(...vals: (number | undefined)[]): number | undefined {
  const present = vals.filter((v): v is number => typeof v === "number");
  if (present.length === 0) return undefined;
  return present.reduce((s, v) => s + v, 0) / present.length;
}

const EXERCISE_PHASE_CONFIG: Record<string, KeyAngleConfig> = {
  // Esercizi statici: una sola fase THROUGHOUT
  "plank": { static: true },
  "plank-laterale": { static: true },

  // Esercizi knee-driven (bottom = ginocchio più flesso = angolo più piccolo)
  "squat": { keyAngle: (a) => avg(a.leftKnee, a.rightKnee) },
  "goblet-squat": { keyAngle: (a) => avg(a.leftKnee, a.rightKnee) },
  "affondi": { keyAngle: (a) => avg(a.leftKnee, a.rightKnee) },
  "bulgarian-split-squat": { keyAngle: (a) => avg(a.leftKnee, a.rightKnee) },
  "leg-press": { keyAngle: (a) => avg(a.leftKnee, a.rightKnee) },

  // Esercizi hip-driven
  "stacco-da-terra": { keyAngle: (a) => avg(a.leftHip, a.rightHip) },
  "romanian-deadlift": { keyAngle: (a) => avg(a.leftHip, a.rightHip) },
  "hip-thrust": { keyAngle: (a) => avg(a.leftHip, a.rightHip) },

  // Esercizi elbow-driven
  "panca-piana": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "push-up": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "military-press": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "tricipiti-cavi": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "curl-bicipiti": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "trazioni": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },
  "rematore-bilanciere": { keyAngle: (a) => avg(a.leftElbow, a.rightElbow) },

  // Esercizi shoulder-driven
  "lateral-raise": { keyAngle: (a) => avg(a.leftShoulder, a.rightShoulder) },
  "face-pull": { keyAngle: (a) => avg(a.leftShoulder, a.rightShoulder) },

  // Esercizi spine-driven
  "crunch": { keyAngle: (a) => a.spineInclination },
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

  const framePhases: ExercisePhase[] = smoothed.map((v, i) => {
    if (typeof v !== "number") return "THROUGHOUT";
    if (v <= bottomThreshold) return "BOTTOM";
    if (v >= topThreshold) return "TOP";
    const prev = smoothed[Math.max(0, i - 3)];
    const next = smoothed[Math.min(smoothed.length - 1, i + 3)];
    if (typeof prev === "number" && typeof next === "number") {
      if (next < prev) return "ECCENTRIC";
      if (next > prev) return "CONCENTRIC";
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
