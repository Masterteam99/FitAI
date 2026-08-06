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
 * Bottone "Installa ora" per la PWA (Fase 6). Usa `beforeinstallprompt` dove
 * supportato (Android/desktop Chrome). Su iOS l'installazione è manuale
 * (Condividi → Aggiungi a Home): mostra un hint verso le istruzioni.
 */
export function InstallPwaButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const nav = navigator as Navigator & { standalone?: boolean };
    setIsIos(/iphone|ipad|ipod/i.test(nav.userAgent));
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

  if (deferred) {
    return (
      <Button
        size="lg"
        className="gap-2 glow-energy"
        onClick={async () => {
          await deferred.prompt();
          setDeferred(null);
        }}
      >
        <Download className="w-5 h-5" /> {copy.scarica.installNow}
      </Button>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {isIos
        ? "Su iPhone: tocca Condividi ⬆ e poi «Aggiungi a Home» — vedi i passaggi qui sotto."
        : "Segui i passaggi qui sotto per installare l'app in 10 secondi."}
    </p>
  );
}
