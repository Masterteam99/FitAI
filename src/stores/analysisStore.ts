import { create } from "zustand";
import type { FrameAnalysis } from "@/types/analysis";

/**
 * Store per Analisi v2.
 *
 * Differenze vs v1:
 * - NESSUN feedback real-time (liveFeedbacks rimosso)
 * - NESSUNA violazione calcolata durante registrazione (rimosso currentViolations/violatedJoints)
 * - frameHistory non più tagliato a 300 (ora tiene tutta la sessione 15-25s ≈ 400-650 frame)
 *   per consentire analisi completa post-acquisizione
 */
interface AnalysisStore {
  analysisSessionId: string | null;
  isRecording: boolean;
  frameCount: number;
  frameHistory: FrameAnalysis[];

  startRecording: (sessionId: string) => void;
  stopRecording: () => void;
  addFrame: (frame: FrameAnalysis) => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  analysisSessionId: null,
  isRecording: false,
  frameCount: 0,
  frameHistory: [],

  startRecording: (sessionId) =>
    set({ analysisSessionId: sessionId, isRecording: true, frameCount: 0, frameHistory: [] }),

  stopRecording: () => set({ isRecording: false }),

  addFrame: (frame) =>
    set((state) => ({
      frameCount: state.frameCount + 1,
      frameHistory: [...state.frameHistory, frame],
    })),

  reset: () =>
    set({
      analysisSessionId: null,
      isRecording: false,
      frameCount: 0,
      frameHistory: [],
    }),
}));
