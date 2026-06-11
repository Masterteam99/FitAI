import { describe, it, expect } from "vitest";
import { detectPhases } from "./phaseDetector";
import type { FrameAnalysis } from "@/types/analysis";

function frameWithKnee(timestamp: number, knee: number): FrameAnalysis {
  return { timestamp, keypoints: [], angles: { leftKnee: knee, rightKnee: knee } };
}

function frameWithElbow(timestamp: number, elbow: number): FrameAnalysis {
  return { timestamp, keypoints: [], angles: { leftElbow: elbow, rightElbow: elbow } };
}

describe("detectPhases", () => {
  it("ritorna timeline vuota senza frame", () => {
    const t = detectPhases([], "squat");
    expect(t.framePhases).toEqual([]);
    expect(t.detectedPhases).toEqual([]);
  });

  it("esercizio statico (plank) => tutte le fasi THROUGHOUT", () => {
    const frames = Array.from({ length: 12 }, (_, i) => frameWithKnee(i, 180));
    const t = detectPhases(frames, "plank");
    expect(t.framePhases).toHaveLength(12);
    expect(t.framePhases.every((p) => p === "THROUGHOUT")).toBe(true);
    expect(t.detectedPhases).toEqual([{ phase: "THROUGHOUT", durationFrames: 12 }]);
  });

  it("slug sconosciuto => fallback THROUGHOUT", () => {
    const frames = Array.from({ length: 12 }, (_, i) => frameWithKnee(i, 180));
    const t = detectPhases(frames, "esercizio-inesistente");
    expect(t.framePhases.every((p) => p === "THROUGHOUT")).toBe(true);
    expect(t.detectedPhases).toEqual([{ phase: "THROUGHOUT", durationFrames: 12 }]);
  });

  it("squat con escursione knee rileva BOTTOM e TOP", () => {
    // bottom = ginocchio piu flesso = angolo piu piccolo (80)
    const pattern = [
      ...Array(10).fill(170),
      ...Array(10).fill(80),
      ...Array(10).fill(170),
    ];
    const frames = pattern.map((k, i) => frameWithKnee(i, k));
    const t = detectPhases(frames, "squat");
    expect(t.framePhases).toHaveLength(30);
    const phases = t.detectedPhases.map((d) => d.phase);
    expect(phases).toContain("BOTTOM");
    expect(phases).toContain("TOP");
    // la somma delle durate copre tutti i frame
    const total = t.detectedPhases.reduce((s, d) => s + d.durationFrames, 0);
    expect(total).toBe(30);
  });

  it("escursione minima (<15 gradi) => ISOMETRIC", () => {
    // 15 frame validi (>= 10 richiesti) con range smussato ~1 grado
    const frames = Array.from({ length: 15 }, (_, i) => frameWithKnee(i, 100 + (i % 2)));
    const t = detectPhases(frames, "squat");
    expect(t.framePhases).toHaveLength(15);
    expect(t.framePhases.every((p) => p === "ISOMETRIC")).toBe(true);
    expect(t.detectedPhases).toEqual([{ phase: "ISOMETRIC", durationFrames: 15 }]);
  });

  it("pochi frame validi (<10) => fallback THROUGHOUT anche se dinamico", () => {
    const pattern = [170, 80, 170, 80, 170, 80, 170, 80];
    const frames = pattern.map((k, i) => frameWithKnee(i, k));
    const t = detectPhases(frames, "squat");
    expect(t.framePhases.every((p) => p === "THROUGHOUT")).toBe(true);
  });

  it("esercizio pull invertito (curl): angolo minimo = TOP, massimo = BOTTOM", () => {
    // curl-bicipiti: contratto (gomito ~40) = top del movimento,
    // disteso (gomito ~170) = bottom del movimento
    const pattern = [
      ...Array(10).fill(170),
      ...Array(10).fill(40),
      ...Array(10).fill(170),
    ];
    const frames = pattern.map((k, i) => frameWithElbow(i, k));
    const t = detectPhases(frames, "curl-bicipiti");
    // I frame contratti (angolo minimo) devono essere etichettati TOP
    expect(t.framePhases[14]).toBe("TOP");
    // I frame distesi (angolo massimo) devono essere etichettati BOTTOM
    expect(t.framePhases[2]).toBe("BOTTOM");
    expect(t.framePhases[27]).toBe("BOTTOM");
  });

  it("esercizio push non invertito (panca): angolo minimo = BOTTOM", () => {
    const pattern = [
      ...Array(10).fill(170),
      ...Array(10).fill(80),
      ...Array(10).fill(170),
    ];
    const frames = pattern.map((k, i) => frameWithElbow(i, k));
    const t = detectPhases(frames, "panca-piana");
    expect(t.framePhases[14]).toBe("BOTTOM");
    expect(t.framePhases[2]).toBe("TOP");
  });
});
