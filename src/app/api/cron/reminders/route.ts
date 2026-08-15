import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { sendPushToUser } from "@/lib/push";

// Chiamato quotidianamente da Vercel Cron (vedi vercel.json).
// Avvisa gli utenti con uno streak attivo che non si sono ancora allenati oggi.
export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const candidates = await prisma.user.findMany({
    where: {
      notifyEmailReminders: true,
      emailVerified: { not: null },
      currentStreak: { gt: 0 },
      OR: [{ lastWorkoutDate: null }, { lastWorkoutDate: { lt: startOfToday } }],
    },
    select: { id: true, email: true, name: true, currentStreak: true },
  });

  let sent = 0;
  for (const u of candidates) {
    try {
      await sendReminderEmail(u.email, u.name, u.currentStreak);
      await sendPushToUser(u.id, {
        title: "Il tuo streak è a rischio 🔥",
        body: `Allenati oggi per non perdere la tua serie di ${u.currentStreak} giorni.`,
        url: "/dashboard",
      });
      sent++;
    } catch (err) {
      console.error("[cron/reminders] invio fallito per utente", u.id, err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: candidates.length });
}
