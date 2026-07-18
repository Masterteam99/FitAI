import { describe, it, expect } from "vitest";
import { buildReferenceProfile } from "./referenceProfile";
import type { FrameAnalysis } from "@/types/analysis";
import type { PhaseTimeline } from "@/services/biomechanical/phaseDetector";

function frame(ts: number, leftKnee: number, spine: number): FrameAnalysis {
  return { timestamp: ts, keypoints: [], angles: { leftKnee, spineInclination: spine } };
}

describe("buildReferenceProfile", () => {
  it("aggrega min/max/media per (giunto × fase)", () => {
    const frames = [frame(0, 100, 10), frame(100, 80, 20), frame(200, 90, 30)];
    const timeline: PhaseTimeline = {
      framePhases: ["BOTTOM", "BOTTOM", "BOTTOM"],
      detectedPhases: [{ phase: "BOTTOM", durationFrames: 3 }],
    };
    const p = buildReferenceProfile(frames, timeline, { fps: 12 });
    const knee = p.movements.find((m) => m.joint === "left_knee" && m.phase === "BOTTOM");
    expect(knee).toBeDefined();
    expect(knee!.minAngle).toBe(80);
    expect(knee!.maxAngle).toBe(100);
    expect(knee!.meanAngle).toBe(90);
    expect(knee!.sampleCount).toBe(3);
    expect(p.meta.fps).toBe(12);
    expect(p.meta.totalFrames).toBe(3);
  });

  it("ignora i giunti senza angolo e le fasi vuote", () => {
    const frames = [frame(0, 100, 10)];
    const timeline: PhaseTimeline = { framePhases: ["TOP"], detectedPhases: [{ phase: "TOP", durationFrames: 1 }] };
    const p = buildReferenceProfile(frames, timeline);
    expect(p.movements.some((m) => m.joint === "right_knee")).toBe(false);
    expect(p.movements.find((m) => m.joint === "left_knee")!.phase).toBe("TOP");
  });

  it("conta le rep dai BOTTOM in detectedPhases", () => {
    const frames = [frame(0, 100, 10), frame(100, 80, 10)];
    const timeline: PhaseTimeline = {
      framePhases: ["TOP", "BOTTOM"],
      detectedPhases: [
        { phase: "TOP", durationFrames: 1 },
        { phase: "BOTTOM", durationFrames: 1 },
        { phase: "TOP", durationFrames: 0 },
        { phase: "BOTTOM", durationFrames: 1 },
      ],
    };
    const p = buildReferenceProfile(frames, timeline);
    expect(p.meta.detectedReps).toBe(2);
  });
});
