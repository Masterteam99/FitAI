import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionCurrentPeriodEnd: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { cancelAtPeriodEnd: true },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  return NextResponse.json({
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd,
    cancelAtPeriodEnd: user.subscriptions[0]?.cancelAtPeriodEnd ?? false,
  });
}
