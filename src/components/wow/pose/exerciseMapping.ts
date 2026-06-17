import type { Archetype, ErrorKey } from "./poseEngine";

/** Mappa un esercizio (slug/nome) su un archetipo di movimento animabile.
 *  Ritorna null se l'esercizio non è tra quelli ricostruibili (squat/hinge). */
export function exerciseToArchetype(input: { slug?: string | null; name?: string | null }): Archetype | null {
  const hay = `${input.slug ?? ""} ${input.name ?? ""}`.toLowerCase();
  if (/(squat|accosciat)/.test(hay)) return "squat";
  if (/(stacco|deadlift|hinge|rumeno|romanian|hip\s?thrust|good\s?morning)/.test(hay)) return "hinge";
  return null;
}

const JOINT_KEYWORDS: Array<{ key: ErrorKey; re: RegExp }> = [
  { key: "knee", re: /(ginocch|knee|valg|var[oi])/i },
  { key: "back", re: /(schien|lombar|dorsal|\bback\b|busto|colonna|spine)/i },
  { key: "hip", re: /(anca|bacino|\bhip\b|gluteo|glute)/i },
];

/** Inferisce il giunto critico dal testo reale del feedback (prima corrispondenza).
 *  Ritorna anche il testo che ha originato il match, per un'eventuale didascalia. */
export function inferErrorMarker(
  texts: Array<string | null | undefined>,
): { key: ErrorKey; note: string } | null {
  for (const t of texts) {
    if (!t) continue;
    for (const { key, re } of JOINT_KEYWORDS) {
      if (re.test(t)) return { key, note: t };
    }
  }
  return null;
}

/** Etichetta breve del giunto, adatta al marker SVG (evita overflow). */
export const JOINT_LABEL: Record<ErrorKey, string> = {
  knee: "ginocchio",
  back: "schiena",
  hip: "anca",
};
