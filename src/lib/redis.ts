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

// Se Upstash è configurato ma irraggiungibile a runtime (rete/DNS giù, istanza
// in pausa), la chiamata `.limit()` lancia: qui degradiamo a fail-open (consenti)
// invece di far crashare la route con un 500 — coerente col comportamento quando
// le env mancano. Il rate limiting resta attivo quando Upstash risponde.
function resilient(limiter: RateLimiter, label: string): RateLimiter {
  return {
    async limit(identifier: string) {
      try {
        return await limiter.limit(identifier);
      } catch (e) {
        console.error(`[ratelimit:${label}] Upstash non raggiungibile, fail-open`, e instanceof Error ? e.message : e);
        return { success: true };
      }
    },
  };
}

function makeLimiter(
  tokens: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
): RateLimiter {
  if (!redis) return noopLimiter;
  return resilient(
    new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tokens, window),
      prefix,
    }),
    prefix,
  );
}

// Rate limiter per endpoint AI (10 req/min)
export const aiRatelimit = makeLimiter(10, "1 m", "rl:ai");

// Rate limiter per analisi video (5/ora)
export const analysisRatelimit = makeLimiter(5, "1 h", "rl:analysis");

// Rate limiter generico (100 req/min)
export const generalRatelimit = makeLimiter(100, "1 m", "rl:general");

// Rate limiter per richieste reset password / verify resend (3/ora per IP+email)
export const authEmailRatelimit = makeLimiter(3, "1 h", "rl:auth-email");

// Prova gratuita ospiti — "start" (creazione sessione, prima di registrare) è economico:
// limite alto per IP, serve solo a bloccare script automatici, non a impedire di rifare
// una ripresa venuta male (i tentativi restano di fatto illimitati per un umano). Il vero
// limite — una sola analisi completata per email, a vita — è applicato via DB in
// /api/guest-analysis/complete, non qui: non è un limite "al giorno".
export const guestAnalysisStartRatelimit = makeLimiter(20, "1 d", "rl:guest-analysis-start");
