import * as Sentry from "@sentry/nextjs";

// Inizializzato SOLO se SENTRY_DSN e' presente (vedi guardia in instrumentation.ts).
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
