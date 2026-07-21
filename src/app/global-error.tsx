"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="it">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#0d1117",
          color: "#e6edf3",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <title>Errore critico — Motion Insight</title>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.12)",
              margin: "0 auto 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 0.75rem" }}>
            Errore critico
          </h1>
          <p style={{ color: "#9ca3af", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
            L&apos;applicazione ha riscontrato un errore inaspettato. Riprova oppure ricarica la pagina.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 1.5rem" }}>
              Codice errore: {error.digest}
            </p>
          )}
          <button
            onClick={() => unstable_retry()}
            style={{
              backgroundColor: "#22c55e",
              color: "#0d1117",
              border: "none",
              borderRadius: 8,
              padding: "0.625rem 1.25rem",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Riprova
          </button>
        </div>
      </body>
    </html>
  );
}
