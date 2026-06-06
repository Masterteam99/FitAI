import { describe, it, expect } from "vitest";
import { computeJointAngles } from "./angleCalculator";
import type { Keypoint } from "@/lib/pose";

describe("computeJointAngles (smoke)", () => {
  it("ritorna oggetto vuoto se non ci sono keypoint validi", () => {
    const kps: Keypoint[] = [];
    expect(computeJointAngles(kps)).toEqual({});
  });
});
