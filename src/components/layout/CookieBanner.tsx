"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "fitai-cookie-consent";
type Choice = "accepted" | "essential-only";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!stored) setVisible(true);
  }, []);

  function record(choice: Choice) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: new Date().toISOString() }));
    setVisible(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: choice }));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consenso cookie"
      className="fixed bottom-0 inset-x-0 z-[200] p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-sm mb-1">Usiamo i cookie</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Usiamo cookie essenziali per l&apos;autenticazione. Con il tuo consenso possiamo abilitare cookie di analytics
              anonimi per migliorare il servizio. Puoi cambiare idea in qualsiasi momento dalle impostazioni.{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Leggi la privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => record("accepted")} className="flex-1 sm:flex-initial">
            Accetta tutti
          </Button>
          <Button onClick={() => record("essential-only")} variant="outline" className="flex-1 sm:flex-initial">
            Solo essenziali
          </Button>
        </div>
      </div>
    </div>
  );
}
