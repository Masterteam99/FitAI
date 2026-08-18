"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { copy } from "@/content/copy";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Bottone "Installa ora" per la PWA (Fase 6) — sempre visibile e cliccabile
 * (prima spariva del tutto finché `beforeinstallprompt` non era disponibile,
 * es. su iOS o al primo caricamento). Se il prompt nativo è disponibile lo usa
 * (Android/desktop Chrome); altrimenti scorre alle istruzioni manuali
 * (Condividi → Aggiungi a Home su iOS, o mentre il prompt non è ancora arrivato).
 */
export function InstallPwaButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    if (window.matchMedia("(display-mode: standalone)").matches || nav.standalone) {
      setInstalled(true);
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
        <Check className="w-4 h-4" /> App già installata
      </p>
    );
  }

  return (
    <Button
      size="lg"
      className="gap-2 glow-energy"
      onClick={async () => {
        if (deferred) {
          await deferred.prompt();
          setDeferred(null);
          return;
        }
        document.getElementById("istruzioni-installazione")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      <Download className="w-5 h-5" /> {copy.scarica.installNow}
    </Button>
  );
}
