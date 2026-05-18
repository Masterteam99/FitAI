import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/verify-email?status=invalid", req.url));

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/verify-email?status=expired", req.url));
  }
  if (record.verifiedAt) {
    return NextResponse.redirect(new URL("/verify-email?status=already", req.url));
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
    prisma.emailVerificationToken.update({ where: { id: record.id }, data: { verifiedAt: new Date() } }),
  ]);

  return NextResponse.redirect(new URL("/verify-email?status=ok", req.url));
}
