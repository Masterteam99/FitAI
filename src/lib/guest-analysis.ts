import { createHash } from "crypto";

// Cookie httpOnly che lega il browser alla sua GuestAnalysisRequest, così le
// route upload-video/complete possono verificare che chi chiama sia lo stesso
// browser che ha dato il consenso in /start — senza bisogno di un account.
export const GUEST_SESSION_COOKIE = "mi_guest_session";
export const GUEST_SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 ora: basta per completare la prova

export function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Non salviamo mai l'IP in chiaro nel DB, solo un hash — sufficiente per il
// rate limiting applicativo senza conservare un dato personale diretto.
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
