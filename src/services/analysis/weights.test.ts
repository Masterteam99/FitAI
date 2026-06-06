import { describe, it, expect } from "vitest";
import { computeCombinedScore, ANALYSIS_WEIGHTS } from "./weights";

describe("computeCombinedScore", () => {
  it("con video PT applica i pesi 50/30/20", () => {
    expect(computeCombinedScore(80, 60, 40, { hasProVideo: true })).toBe(66);
  });

  it("senza video PT applica 62.5/37.5 e ignora L3", () => {
    expect(computeCombinedScore(80, 60, -1, { hasProVideo: false })).toBe(73);
  });

  it("senza video PT il valore di L3 non cambia il risultato", () => {
    const a = computeCombinedScore(80, 60, -1, { hasProVideo: false });
    const b = computeCombinedScore(80, 60, 999, { hasProVideo: false });
    expect(a).toBe(b);
  });

  it("i pesi sono normalizzati", () => {
    const p = ANALYSIS_WEIGHTS.withProVideo;
    expect(p.l1 + p.l2 + p.l3).toBeCloseTo(1);
    const np = ANALYSIS_WEIGHTS.withoutProVideo;
    expect(np.l1 + np.l2).toBeCloseTo(1);
  });
});
