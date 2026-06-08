import * as Sentry from "@sentry/nextjs";

// ZERO impatto in dev: senza NEXT_PUBLIC_SENTRY_DSN il client non si inizializza.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

// Richiesto da Sentry per il tracing delle navigazioni App Router (no-op senza init).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
