// src/services/ai/visionAnalyzer.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/anthropic", () => ({
  anthropic: { messages: { create: vi.fn() } },
  MODELS: { FAST: "m", DEFAULT: "m", POWERFUL: "m" },
}));

import { anthropic } from "@/lib/anthropic";
import { analyzeUserVideoVision, compareVideoVision, type VisionFrame } from "./visionAnalyzer";

const create = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>;
const frame: VisionFrame = { base64: "AAAA", mediaType: "image/jpeg", label: "BOTTOM" };

beforeEach(() => create.mockReset());

describe("analyzeUserVideoVision", () => {
  it("ritorna score 0 senza frame (nessuna chiamata AI)", async () => {
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [] });
    expect(r.score).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it("parsa il JSON valido dell'AI", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ score: 88, qualitativeAnalysis: "ok", visualObservations: ["a"], injuryRiskFlags: [] }) }],
    });
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame] });
    expect(r.score).toBe(88);
    expect(r.visualObservations).toEqual(["a"]);
  });

  it("fallback score 60 se l'AI risponde con testo non-JSON", async () => {
    create.mockResolvedValue({ content: [{ type: "text", text: "testo libero" }] });
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame] });
    expect(r.score).toBe(60);
  });
});

describe("compareVideoVision", () => {
  it("ritorna score 0 se mancano i frame PT", async () => {
    const r = await compareVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame], proFrames: [] });
    expect(r.score).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it("parsa il JSON valido del confronto", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ score: 75, comparisonFeedback: "vicino", keyDifferences: [] }) }],
    });
    const r = await compareVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame], proFrames: [frame] });
    expect(r.score).toBe(75);
  });
});
