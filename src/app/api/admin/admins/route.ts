import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError, parseAdminEmails } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const envEmails = parseAdminEmails();
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, email: true, name: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({
    envEmails,
    admins: admins.map((a) => ({
      id: a.id,
      email: a.email,
      name: a.name,
      origin: envEmails.includes(a.email.toLowerCase()) ? "auto" : "manual",
      updatedAt: a.updatedAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
