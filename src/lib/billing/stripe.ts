import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY non configurata");
    stripeClient = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY ?? "";
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export type PriceTier = "MONTHLY" | "YEARLY";

export function priceIdForPlan(plan: PriceTier): string {
  return plan === "MONTHLY" ? STRIPE_PRICE_MONTHLY : STRIPE_PRICE_YEARLY;
}

export function planForPriceId(priceId: string): "MONTHLY" | "YEARLY" | null {
  if (priceId === STRIPE_PRICE_MONTHLY) return "MONTHLY";
  if (priceId === STRIPE_PRICE_YEARLY) return "YEARLY";
  return null;
}
