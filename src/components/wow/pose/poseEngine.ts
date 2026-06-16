export type Point = [number, number];

export const JOINTS = [
  "head", "shoulder", "elbow", "hand", "hip", "knee", "ankle", "foot",
] as const;
export type Joint = (typeof JOINTS)[number];

export type Pose = Record<Joint, Point>;
export type Archetype = "squat" | "hinge";
export type ErrorKey = "knee" | "back" | "hip";

export interface ExercisePoses {
  start: Pose;
  end: Pose;
  defaultError: ErrorKey;
}

const STANDING: Pose = {
  head: [100, 46],
  shoulder: [100, 70],
  elbow: [108, 108],
  hand: [114, 150],
  hip: [101, 152],
  knee: [100, 212],
  ankle: [100, 266],
  foot: [120, 266],
};

export const ARCHETYPES: Record<Archetype, ExercisePoses> = {
  squat: {
    start: STANDING,
    end: {
      head: [86, 100],
      shoulder: [90, 122],
      elbow: [112, 140],
      hand: [142, 146],
      hip: [96, 176],
      knee: [122, 206],
      ankle: [100, 266],
      foot: [120, 266],
    },
    defaultError: "knee",
  },
  hinge: {
    start: STANDING,
    end: {
      head: [66, 116],
      shoulder: [80, 122],
      elbow: [82, 160],
      hand: [84, 196],
      hip: [120, 150],
      knee: [114, 210],
      ankle: [100, 266],
      foot: [120, 266],
    },
    defaultError: "back",
  },
};

export const SEGMENTS: Array<[Joint, Joint]> = [
  ["head", "shoulder"],
  ["shoulder", "hip"],
  ["shoulder", "elbow"],
  ["elbow", "hand"],
  ["hip", "knee"],
  ["knee", "ankle"],
  ["ankle", "foot"],
];

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const k = clamp01(t);
  const out = {} as Pose;
  for (const j of JOINTS) {
    out[j] = [
      a[j][0] + (b[j][0] - a[j][0]) * k,
      a[j][1] + (b[j][1] - a[j][1]) * k,
    ];
  }
  return out;
}

export function errorJoint(key: ErrorKey, pose: Pose): Point {
  if (key === "knee") return pose.knee;
  if (key === "hip") return pose.hip;
  return [
    (pose.shoulder[0] + pose.hip[0]) / 2,
    (pose.shoulder[1] + pose.hip[1]) / 2,
  ];
}
