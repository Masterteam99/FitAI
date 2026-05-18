type SentryLike = {
  captureException: (err: unknown, ctx?: Record<string, unknown>) => void;
  captureMessage: (msg: string, level?: "info" | "warning" | "error") => void;
  setUser: (user: { id?: string; email?: string } | null) => void;
};

let sentry: SentryLike | null = null;
let initialized = false;

async function tryInitSentry(): Promise<void> {
  if (initialized) return;
  initialized = true;
  if (!process.env.SENTRY_DSN) return;

  try {
    const mod = await import(/* webpackIgnore: true */ "@sentry/nextjs" as string).catch(() => null) as
      | { init: (cfg: Record<string, unknown>) => void; captureException: (err: unknown, ctx?: unknown) => void; captureMessage: (msg: string, level?: string) => void; setUser: (user: unknown) => void }
      | null;
    if (!mod) {
      console.warn("[observability] SENTRY_DSN set but @sentry/nextjs not installed");
      return;
    }
    mod.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
    sentry = {
      captureException: (err, ctx) => mod.captureException(err, ctx ? { extra: ctx } : undefined),
      captureMessage: (msg, level) => mod.captureMessage(msg, level),
      setUser: (user) => mod.setUser(user),
    };
  } catch (err) {
    console.error("[observability] Sentry init failed:", err);
  }
}

void tryInitSentry();

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  console.error("[error]", err, context ?? "");
  sentry?.captureException(err, context);
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  const fn = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
  fn(`[${level}]`, message);
  sentry?.captureMessage(message, level);
}

export function setUserContext(user: { id?: string; email?: string } | null): void {
  sentry?.setUser(user);
}
