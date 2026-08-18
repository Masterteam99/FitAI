"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

const PAGES = [
  { href: "/", label: "Home" },
  { href: "/prezzi", label: "Prezzi" },
  { href: "/come-funziona", label: "Il Metodo" },
  { href: "/per-chi", label: "Per Chi" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/faq", label: "FAQ" },
  { href: "/risorse", label: "Risorse" },
  { href: "/scarica", label: "Scarica l'app" },
  { href: "/prova-gratuita", label: "Prova gratuita" },
];

/**
 * Punto di accesso unico all'editor "designer": un'anteprima live del sito
 * pubblico dentro un iframe, con la pagina caricata in modalità modifica
 * (?siteEditor=1 — vedi SiteEditModeProvider). L'admin clicca un testo
 * direttamente nell'anteprima per modificarlo; nessun'altra pagina del sito
 * mostra mai i controlli di modifica al di fuori di qui.
 */
export function SiteVisualEditor() {
  const [page, setPage] = useState(PAGES[0].href);
  const [mobile, setMobile] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={page}
          onChange={(e) => { setPage(e.target.value); setReloadKey((k) => k + 1); }}
          className="h-9 px-3 rounded-lg border border-border bg-input text-sm"
        >
          {PAGES.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
        </select>
        <div className="flex gap-1 ml-auto">
          <button
            type="button"
            onClick={() => setMobile(false)}
            aria-label="Vista desktop"
            className={`w-9 h-9 rounded-lg grid place-items-center border ${!mobile ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMobile(true)}
            aria-label="Vista mobile"
            className={`w-9 h-9 rounded-lg grid place-items-center border ${mobile ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-secondary/30 flex justify-center p-3">
        <iframe
          key={`${page}-${reloadKey}`}
          src={`${page}?siteEditor=1`}
          title="Anteprima editabile del sito"
          className="bg-background rounded-lg"
          style={{ width: mobile ? 390 : "100%", height: "78vh", border: "none" }}
        />
      </div>
    </div>
  );
}
