// src/services/ai/finalReportGenerator.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/anthropic", () => ({
  anthropic: { messages: { create: vi.fn() } },
  MODELS: { FAST: "m", DEFAULT: "m", POWERFUL: "m" },
}));

import { anthropic } from "@/lib/anthropic";
import { generateFinalReport } from "./finalReportGenerator";
import type { L1Result, L2Result, L3Result } from "@/types/analysis";

const l1: L1Result = { score: 80, triggeredFeedback: [], detectedPhases: [], rawAnglesSampled: [] };
const l2: L2Result = { score: 60, qualitativeAnalysis: "", visualObservations: [], injuryRiskFlags: [] };
const l3: L3Result = { score: 40, comparisonFeedback: "", keyDifferences: [] };

const create = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>;

function mockJson(obj: unknown) {
  create.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify(obj) }] });
}

beforeEach(() => create.mockReset());

describe("generateFinalReport", () => {
  it("combinedScore segue i pesi (50/30/20) e sovrascrive quello dell'AI", async () => {
    mockJson({
      combinedScore: 999,
      overallJudgment: "ok",
      prioritizedImprovements: [],
      injuryRiskAlert: { level: "BASSO", explanation: "", affectedAreas: [] },
      positiveAspects: [],
    });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: true });
    expect(r.combinedScore).toBe(66); // 80*.5 + 60*.3 + 40*.2
  });

  it("senza video PT usa 62.5/37.5", async () => {
    mockJson({
      combinedScore: 0,
      overallJudgment: "ok",
      prioritizedImprovements: [],
      injuryRiskAlert: { level: "BASSO", explanation: "", affectedAreas: [] },
      positiveAspects: [],
    });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: false });
    expect(r.combinedScore).toBe(73); // 80*.625 + 60*.375
  });

  it("fallback robusto se l'AI risponde con testo non-JSON", async () => {
    create.mockResolvedValue({ content: [{ type: "text", text: "non e' json" }] });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: true });
    expect(r.combinedScore).toBe(66);
    expect(typeof r.overallJudgment).toBe("string");
  });
});
