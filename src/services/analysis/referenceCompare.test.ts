import { describe, it, expect } from "vitest";
import { compareToReference } from "./referenceProfile";
import type { ReferenceProfile, ReferenceMovement } from "@/types/analysis";

const mv = (joint: string, phase: string, meanAngle: number): ReferenceMovement => ({
  joint,
  phase,
  minAngle: meanAngle,
  maxAngle: meanAngle,
  meanAngle,
  sampleCount: 10,
});

const profile = (movs: ReferenceMovement[]): ReferenceProfile => ({
  movements: movs,
  meta: { fps: 12, totalFrames: 100, detectedReps: 3 },
});

describe("compareToReference", () => {
  it("dà 100 se l'utente coincide col PT", () => {
    const pt = profile([mv("left_knee", "BOTTOM", 90)]);
    const user = profile([mv("left_knee", "BOTTOM", 90)]);
    const r = compareToReference(user, pt);
    expect(r.numericScore).toBe(100);
    expect(r.keyDifferences).toHaveLength(0);
  });

  it("penalizza la deviazione oltre tolleranza e la riporta", () => {
    const pt = profile([mv("left_hip", "BOTTOM", 90)]);
    const user = profile([mv("left_hip", "BOTTOM", 72)]); // 18° di deviazione, tolleranza 15
    const r = compareToReference(user, pt, { toleranceDeg: 15 });
    expect(r.numericScore).toBeLessThan(100);
    expect(r.keyDifferences[0].aspect).toContain("BOTTOM");
    expect(r.keyDifferences[0].user).toBe("72°");
    expect(r.keyDifferences[0].pro).toBe("90°");
  });

  it("ignora le coppie non presenti in entrambi", () => {
    const pt = profile([mv("spine", "THROUGHOUT", 20)]);
    const user = profile([mv("left_knee", "BOTTOM", 90)]);
    const r = compareToReference(user, pt);
    expect(r.numericScore).toBe(0); // nessuna coppia comune → nessuna aderenza
    expect(r.keyDifferences).toHaveLength(0);
  });
});
