import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// La risposta pubblica non espone dettagli di infrastruttura: lo stato
// degradato viaggia solo nel codice HTTP (200/503) per gli uptime monitor.
// Il dettaglio dei check richiede HEALTH_CHECK_TOKEN via header x-health-token.
export async function GET(req: NextRequest) {
  const checks: Record<string, "ok" | "fail"> = {};
  let allOk = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "fail";
    allOk = false;
  }

  const token = process.env.HEALTH_CHECK_TOKEN;
  const authorized = !!token && req.headers.get("x-health-token") === token;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      ...(authorized && { checks, env: process.env.NODE_ENV ?? "unknown" }),
    },
    { status: allOk ? 200 : 503 },
  );
}
