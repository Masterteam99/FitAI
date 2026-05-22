import { auth } from "./auth";
import { prisma } from "./prisma";

export function parseAdminEmails(): string[] {
  const csv = process.env.ADMIN_EMAILS ?? "";
  return csv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}

export class AdminAccessError extends Error {
  constructor(public readonly status: 401 | 403, message: string) {
    super(message);
    this.name = "AdminAccessError";
  }
}

export async function requireAdmin(): Promise<{ userId: string; email: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    throw new AdminAccessError(401, "Non autorizzato");
  }
  const userId = session.user.id as string;
  const email = session.user.email;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  if (!user) throw new AdminAccessError(401, "Utente non trovato");

  let isAdmin = user.isAdmin;
  if (!isAdmin && isAdminEmail(email)) {
    await prisma.user.update({ where: { id: userId }, data: { isAdmin: true } });
    isAdmin = true;
  }

  if (!isAdmin) throw new AdminAccessError(403, "Accesso amministratore richiesto");
  return { userId, email };
}
