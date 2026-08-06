import type { Keypoint } from "@/lib/pose";

export interface JointAngles {
  leftElbow?: number;
  rightElbow?: number;
  leftShoulder?: number;
  rightShoulder?: number;
  leftHip?: number;
  rightHip?: number;
  leftKnee?: number;
  rightKnee?: number;
  leftAnkle?: number;
  rightAnkle?: number;
  spineInclination?: number;
}

export interface FrameAnalysis {
  timestamp: number;
  keypoints: Keypoint[];
  worldKeypoints?: Keypoint[]; // 3D in metri (BlazePose worldLandmarks) — usato per angoli 3D in v2
  angles: JointAngles;
}

// Analisi v2 — output strutturati per ciascuna delle 3 logiche

export interface L1Result {
  score: number;
  triggeredFeedback: { feedback: string; severity: "WARNING" | "ERROR" | "CRITICAL"; injuryRisk: boolean }[];
  detectedPhases: { phase: string; durationFrames: number }[];
  rawAnglesSampled: { timestamp: number; angles: JointAngles }[]; // sample per debug/UI dettagli
}

export interface L2Result {
  score: number;
  qualitativeAnalysis: string;
  visualObservations: string[];
  injuryRiskFlags: string[];
}

export interface L3Result {
  score: number;
  comparisonFeedback: string;
  keyDifferences: { aspect: string; user: string; pro: string }[];
  numericScore?: number; // punteggio del confronto numerico col profilo PT (se disponibile)
}

export interface ReferenceMovement {
  joint: string; // es. "spine", "left_knee"
  phase: string; // es. "THROUGHOUT", "BOTTOM"
  minAngle: number;
  maxAngle: number;
  meanAngle: number;
  sampleCount: number;
}

export interface ReferenceProfile {
  movements: ReferenceMovement[];
  meta: { fps: number; totalFrames: number; detectedReps: number };
}

export interface FinalReport {
  combinedScore: number;
  overallJudgment: string;
  prioritizedImprovements: string[];
  injuryRiskAlert: {
    level: "BASSO" | "MEDIO" | "ALTO";
    explanation: string;
    affectedAreas: string[];
  };
  positiveAspects: string[];
}

