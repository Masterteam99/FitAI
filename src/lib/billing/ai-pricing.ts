const USD_TO_EUR = 0.92;

const PRICING_PER_1M_USD = {
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.25, output: 1.25 },
};

export const FEATURE_TOKEN_ESTIMATES = {
  generate_plan: { input: 2000, output: 3500, model: "claude-sonnet-4-6" },
  generate_nutrition_plan: { input: 1800, output: 3000, model: "claude-sonnet-4-6" },
  ai_chat: { input: 1000, output: 800, model: "claude-sonnet-4-6" },
  analysis_start: { input: 1500, output: 2000, model: "claude-sonnet-4-6" },
} as const;

export type FeatureKey = keyof typeof FEATURE_TOKEN_ESTIMATES;

export function estimateCostEur(callsByFeature: Record<string, number>): number {
  let totalUsd = 0;
  for (const [feature, count] of Object.entries(callsByFeature)) {
    const est = FEATURE_TOKEN_ESTIMATES[feature as FeatureKey];
    if (!est) continue;
    const pricing = PRICING_PER_1M_USD[est.model as keyof typeof PRICING_PER_1M_USD];
    if (!pricing) continue;
    const costPerCall = (est.input / 1_000_000) * pricing.input + (est.output / 1_000_000) * pricing.output;
    totalUsd += costPerCall * count;
  }
  return Math.round(totalUsd * USD_TO_EUR * 100) / 100;
}
