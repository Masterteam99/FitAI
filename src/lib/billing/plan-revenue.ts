// Ricavo mensile per utente in base al piano — usato dall'Account Manager per
// calcolare il margine (ricavo − costo AI stimato) per utente e per la piattaforma.
// Fonte prezzi: landing/prezzi (Premium €9,90/mese, Annuale €79,90/anno).
// Modificabili qui senza toccare la logica.
export const PLAN_PRICE_EUR = {
  MONTHLY: 9.9,
  YEARLY: 79.9,
} as const;

// Ricavo mensile equivalente (annuale spalmato su 12 mesi).
export const MONTHLY_REVENUE_EUR = {
  MONTHLY: PLAN_PRICE_EUR.MONTHLY,
  YEARLY: Math.round((PLAN_PRICE_EUR.YEARLY / 12) * 100) / 100,
} as const;

// Ricavo mensile attribuibile a un singolo utente.
// Un "premium regalato" (grant) NON genera ricavo: costo AI a fronte di 0 ricavo
// → margine negativo, ed è esattamente ciò che il gestore deve vedere.
export function userMonthlyRevenueEur(params: {
  subscriptionStatus: string;
  subscriptionPlan: string | null;
}): number {
  const isPaying = params.subscriptionStatus === "ACTIVE" || params.subscriptionStatus === "TRIALING";
  if (!isPaying) return 0;
  if (params.subscriptionPlan === "YEARLY") return MONTHLY_REVENUE_EUR.YEARLY;
  if (params.subscriptionPlan === "MONTHLY") return MONTHLY_REVENUE_EUR.MONTHLY;
  // Attivo ma piano non specificato: assumiamo il mensile.
  return MONTHLY_REVENUE_EUR.MONTHLY;
}
