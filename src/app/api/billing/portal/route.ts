import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/billing/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Pagamenti non configurati" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) return NextResponse.json({ error: "Nessun abbonamento attivo" }, { status: 404 });

  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/abbonamento`,
  });

  return NextResponse.json({ url: portal.url });
}
