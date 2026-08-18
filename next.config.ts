import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // SAMEORIGIN (non DENY): serve per incorporare le pagine pubbliche nell'iframe
          // dell'editor visuale in /admin/site-content. Protezione da clickjacking di
          // altri siti resta piena — solo il nostro stesso dominio può incorniciarci.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

// Sentry build plugin: inerte senza auth token (nessun upload sourcemap, nessun fallimento build).
// L'SDK runtime resta comunque no-op finche' SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN non sono settati.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Senza auth token l'upload sourcemap viene saltato comunque; disabilitato esplicitamente
  // quando il token manca per evitare warning rumorosi nei build locali.
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  telemetry: false,
});
