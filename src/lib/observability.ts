import * as Sentry from "@sentry/nextjs";

// API pubblica di osservabilita'. Sentry e' inizializzato solo quando
// SENTRY_DSN (server) / NEXT_PUBLIC_SENTRY_DSN (client) sono presenti:
// senza DSN le chiamate Sentry sono no-op e resta solo il fallback su console.

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  console.error("[error]", err, context ?? "");
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  const fn = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
  fn(`[${level}]`, message);
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id?: string; email?: string } | null): void {
  Sentry.setUser(user);
}
