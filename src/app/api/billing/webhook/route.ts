import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured, STRIPE_WEBHOOK_SECRET, planForPriceId } from "@/lib/billing/stripe";
import type Stripe from "stripe";
import { captureError } from "@/lib/observability";

export const runtime = "nodejs";

function mapStatus(s: Stripe.Subscription.Status): "FREE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" {
  switch (s) {
    case "active": return "ACTIVE";
    case "trialing": return "TRIALING";
    case "past_due": return "PAST_DUE";
    case "unpaid": return "PAST_DUE";
    case "canceled": return "CANCELED";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "FREE";
    default:
      return "FREE";
  }
}

async function upsertSubscriptionFromStripe(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) {
    console.warn("[webhook] no user for customer", customerId);
    return;
  }
  const item = sub.items.data[0];
  const priceId = item?.price.id ?? "";
  const plan = planForPriceId(priceId);
  const status = mapStatus(sub.status);
  const periodStart = new Date((item?.current_period_start ?? 0) * 1000);
  const periodEnd = new Date((item?.current_period_end ?? 0) * 1000);

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      create: {
        userId: user.id,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId,
        status,
        plan: plan ?? "MONTHLY",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      update: {
        stripePriceId: priceId,
        status,
        plan: plan ?? "MONTHLY",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: status,
        subscriptionPlan: plan,
        subscriptionCurrentPeriodEnd: periodEnd,
      },
    }),
  ]);
}

export async function POST(req: NextRequest) {
  if (!isStripeConfigured() || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook non configurato" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    captureError(err, { stage: "stripe.webhook.signature" });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sess = event.data.object as Stripe.Checkout.Session;
        if (sess.subscription) {
          const subId = typeof sess.subscription === "string" ? sess.subscription : sess.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscriptionFromStripe(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripe(sub);
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const customerId = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (customerId) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { subscriptionStatus: "PAST_DUE" },
          });
        }
        break;
      }
      case "charge.dispute.created": {
        // Chargeback: segnale di frode, sospendiamo subito l'accesso premium.
        // L'evento va registrato anche nella config webhook su dashboard Stripe.
        const dispute = event.data.object as Stripe.Dispute;
        let customerId: string | undefined;
        const charge = typeof dispute.charge === "string"
          ? await stripe.charges.retrieve(dispute.charge)
          : dispute.charge;
        if (charge?.customer) {
          customerId = typeof charge.customer === "string" ? charge.customer : charge.customer.id;
        }
        if (customerId) {
          const updated = await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { subscriptionStatus: "PAST_DUE" },
          });
          captureError(new Error("Stripe dispute ricevuta"), {
            stage: "stripe.webhook.dispute",
            customerId,
            disputeId: dispute.id,
            usersUpdated: updated.count,
          });
        } else {
          captureError(new Error("Stripe dispute senza customer risolvibile"), {
            stage: "stripe.webhook.dispute",
            disputeId: dispute.id,
          });
        }
        break;
      }
    }
  } catch (err) {
    captureError(err, { stage: "stripe.webhook.handler", eventType: event.type });
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
