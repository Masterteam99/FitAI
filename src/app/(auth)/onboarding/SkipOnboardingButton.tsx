"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { readOnboarding, clearOnboarding } from "./onboardingState";

// "Salta per il momento": invia i dati parziali già inseriti, marca l'onboarding
// come completato (profilo minimo) e porta alla dashboard senza generare un piano.
export function SkipOnboardingButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function skip() {
    setBusy(true);
    try {
      const partial = readOnboarding();
      await fetch("/api/onboarding/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      clearOnboarding();
      router.push("/dashboard");
    } catch {
      // Anche in caso di errore proviamo a portare l'utente nell'app.
      router.push("/dashboard");
    }
  }

  return (
    <button
      type="button"
      onClick={skip}
      disabled={busy}
      className={`text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors disabled:opacity-50 ${className ?? ""}`}
    >
      {busy ? "Attendi…" : "Salta per il momento"}
    </button>
  );
}
