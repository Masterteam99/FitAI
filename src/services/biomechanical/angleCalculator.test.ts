// src/services/biomechanical/angleCalculator.test.ts
import { describe, it, expect } from "vitest";
import { computeJointAngles } from "./angleCalculator";
import type { Keypoint } from "@/lib/pose";

function kp(name: string, x: number, y: number, score = 1): Keypoint {
  return { name, x, y, score };
}

describe("computeJointAngles", () => {
  it("ritorna oggetto vuoto senza keypoint validi", () => {
    expect(computeJointAngles([])).toEqual({});
  });

  it("calcola il gomito sinistro a 90 gradi", () => {
    // vertice = gomito in (0,0); polso in (1,0); spalla in (0,1) => 90°
    const kps = [
      kp("left_wrist", 1, 0),
      kp("left_elbow", 0, 0),
      kp("left_shoulder", 0, 1),
    ];
    const angles = computeJointAngles(kps);
    expect(angles.leftElbow).toBeCloseTo(90, 1);
  });

  it("ignora i keypoint con confidence troppo bassa (<=0.3)", () => {
    const kps = [
      kp("left_wrist", 1, 0, 0.1),
      kp("left_elbow", 0, 0, 0.1),
      kp("left_shoulder", 0, 1, 0.1),
    ];
    expect(computeJointAngles(kps).leftElbow).toBeUndefined();
  });
});
