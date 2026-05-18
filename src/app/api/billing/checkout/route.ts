import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getStripe, isStripeConfigured, priceIdForPlan } from "@/lib/billing/stripe";

const schema = z.object({ plan: z.enum(["MONTHLY", "YEARLY"]) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Pagamenti non configurati. Vedi CHECKLIST_DEPLOY.md sezione M4." }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Piano non valido" }, { status: 400 });

  const priceId = priceIdForPlan(parsed.data.plan);
  if (!priceId) return NextResponse.json({ error: "Prezzo non configurato" }, { status: 500 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { id: true, email: true, name: true, stripeCustomerId: true },
  });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const stripe = getStripe();

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/abbonamento?status=success`,
    cancel_url: `${appUrl}/abbonamento?status=cancel`,
    allow_promotion_codes: true,
    subscription_data: { metadata: { userId: user.id } },
  });

  return NextResponse.json({ url: checkout.url });
}
