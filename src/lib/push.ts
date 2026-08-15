import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:support@motioninsight.app";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export function isPushConfigured() {
  return Boolean(publicKey && privateKey);
}

type PushPayload = { title: string; body: string; url?: string };

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!isPushConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
        } else {
          console.error("[push] invio fallito", err);
        }
      }
    })
  );
}
