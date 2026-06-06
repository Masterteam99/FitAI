// Pesi della triplice analisi. Fonte di verità unica: NON duplicare altrove.
// L1 (biomeccanica oggettiva) domina; L2 (vision AI) e L3 (confronto PT) sono advisory.
export const ANALYSIS_WEIGHTS = {
  withProVideo: { l1: 0.5, l2: 0.3, l3: 0.2 },
  // Senza video PT, il peso di L3 è ridistribuito in proporzione su L1/L2.
  withoutProVideo: { l1: 0.625, l2: 0.375 },
} as const;

export function computeCombinedScore(
  l1Score: number,
  l2Score: number,
  l3Score: number,
  opts: { hasProVideo: boolean }
): number {
  if (opts.hasProVideo) {
    const w = ANALYSIS_WEIGHTS.withProVideo;
    return Math.round(l1Score * w.l1 + l2Score * w.l2 + l3Score * w.l3);
  }
  const w = ANALYSIS_WEIGHTS.withoutProVideo;
  return Math.round(l1Score * w.l1 + l2Score * w.l2);
}
