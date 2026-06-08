import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeVolumeHeatmap, computeRecovery, computeImbalances } from "@/lib/body-map";

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") ?? "volume";
  const days = Math.max(1, Math.min(365, parseInt(url.searchParams.get("days") ?? "30", 10)));

  if (mode === "volume") {
    const { raw, normalized } = await computeVolumeHeatmap(userId, days);
    return NextResponse.json({ mode, days, raw, data: normalized });
  }
  if (mode === "recovery") {
    const data = await computeRecovery(userId);
    return NextResponse.json({ mode, data });
  }
  if (mode === "balance") {
    const data = await computeImbalances(userId, days);
    return NextResponse.json({ mode, days, data });
  }
  return NextResponse.json({ error: "Mode non valido: volume|recovery|balance" }, { status: 400 });
}
