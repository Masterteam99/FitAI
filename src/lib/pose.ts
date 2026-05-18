"use client";

import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export interface Keypoint {
  name: string;
  x: number;
  y: number;
  z?: number;
  score: number;
}

export interface PoseResult {
  keypoints: Keypoint[];
  score: number;
}

// Indici MediaPipe BlazePose 33 punti (ordine ufficiale)
export const KEYPOINT_NAMES = [
  "nose", "left_eye_inner", "left_eye", "left_eye_outer",
  "right_eye_inner", "right_eye", "right_eye_outer",
  "left_ear", "right_ear", "mouth_left", "mouth_right",
  "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
  "left_wrist", "right_wrist", "left_pinky", "right_pinky",
  "left_index", "right_index", "left_thumb", "right_thumb",
  "left_hip", "right_hip", "left_knee", "right_knee",
  "left_ankle", "right_ankle", "left_heel", "right_heel",
  "left_foot_index", "right_foot_index",
] as const;

export type KeypointName = (typeof KEYPOINT_NAMES)[number];

export function getKeypoint(keypoints: Keypoint[], name: KeypointName): Keypoint | undefined {
  return keypoints.find((kp) => kp.name === name);
}

export function getKeypointOrThrow(keypoints: Keypoint[], name: KeypointName): Keypoint {
  const kp = getKeypoint(keypoints, name);
  if (!kp) throw new Error(`Keypoint ${name} non trovato`);
  return kp;
}

// Converte i landmark MediaPipe (normalizzati 0-1) nel formato Keypoint con coordinate in pixel.
export function mapLandmarksToKeypoints(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
): Keypoint[] {
  return landmarks.map((lm, i) => ({
    name: KEYPOINT_NAMES[i] ?? `landmark_${i}`,
    x: lm.x * width,
    y: lm.y * height,
    z: lm.z,
    score: lm.visibility ?? 1,
  }));
}

// Converte i worldLandmarks MediaPipe (coordinate 3D in metri rispetto al centro dei fianchi)
// nel formato Keypoint. Non richiede de-normalizzazione (sono già in unità reali).
// Usati per calcoli angolari 3D indipendenti dall'angolazione della camera.
export function mapWorldLandmarks(landmarks: NormalizedLandmark[]): Keypoint[] {
  return landmarks.map((lm, i) => ({
    name: KEYPOINT_NAMES[i] ?? `landmark_${i}`,
    x: lm.x,
    y: lm.y,
    z: lm.z,
    score: lm.visibility ?? 1,
  }));
}

// Calcola angolo in gradi tra tre punti (B è il vertice).
// Usa dot product 3D se z è disponibile su tutti e 3 i punti (più accurato,
// indipendente dall'angolazione camera). Altrimenti calcolo 2D classico.
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const has3D = a.z !== undefined && b.z !== undefined && c.z !== undefined;
  if (has3D) {
    const v1x = a.x - b.x, v1y = a.y - b.y, v1z = (a.z as number) - (b.z as number);
    const v2x = c.x - b.x, v2y = c.y - b.y, v2z = (c.z as number) - (b.z as number);
    const dot = v1x * v2x + v1y * v2y + v1z * v2z;
    const m1 = Math.hypot(v1x, v1y, v1z);
    const m2 = Math.hypot(v2x, v2y, v2z);
    if (m1 === 0 || m2 === 0) return 0;
    const cos = Math.max(-1, Math.min(1, dot / (m1 * m2)));
    return (Math.acos(cos) * 180) / Math.PI;
  }
  // Fallback 2D
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

// Disegna skeleton su canvas overlay
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  violations: Set<string> = new Set(),
  minConfidence = 0.3
) {
  const connections: [KeypointName, KeypointName][] = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];

  ctx.lineWidth = 3;
  connections.forEach(([from, to]) => {
    const kpFrom = getKeypoint(keypoints, from);
    const kpTo = getKeypoint(keypoints, to);
    if (!kpFrom || !kpTo || kpFrom.score < minConfidence || kpTo.score < minConfidence) return;
    const isViolation = violations.has(from) || violations.has(to);
    ctx.strokeStyle = isViolation ? "#ef4444" : "#22c55e";
    ctx.beginPath();
    ctx.moveTo(kpFrom.x, kpFrom.y);
    ctx.lineTo(kpTo.x, kpTo.y);
    ctx.stroke();
  });

  keypoints.forEach((kp) => {
    if (kp.score < minConfidence) return;
    const isViolation = violations.has(kp.name);
    ctx.fillStyle = isViolation ? "#ef4444" : "#ffffff";
    ctx.beginPath();
    ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
}
