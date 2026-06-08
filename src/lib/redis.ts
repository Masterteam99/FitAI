import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Interfaccia minima usata dai chiamanti (solo `.limit().success`).
interface RateLimiter {
  limit(identifier: string): Promise<{ success: boolean }>;
}

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

// Quando Upstash non è configurato (dev locale, CI) il rate limiting è
// best-effort: degrada a no-op (consente sempre) invece di far crashare le
// route con un 500. In produzione le env sono presenti e il limiter è attivo.
const noopLimiter: RateLimiter = {
  async limit() {
    return { success: true };
  },
};

function makeLimiter(
  tokens: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
): RateLimiter {
  if (!redis) return noopLimiter;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
  });
}

// Rate limiter per endpoint AI (10 req/min)
export const aiRatelimit = makeLimiter(10, "1 m", "rl:ai");

// Rate limiter per analisi video (5/ora)
export const analysisRatelimit = makeLimiter(5, "1 h", "rl:analysis");

// Rate limiter generico (100 req/min)
export const generalRatelimit = makeLimiter(100, "1 m", "rl:general");

// Rate limiter per richieste reset password / verify resend (3/ora per IP+email)
export const authEmailRatelimit = makeLimiter(3, "1 h", "rl:auth-email");
