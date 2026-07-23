"use client";

import { useState } from "react";
import { Zap, BatteryLow, Clock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS = [
  { key: "energico", label: "Energico", icon: Zap, banner: "Ottimo! Ho mantenuto il volume pieno per oggi." },
  { key: "stanco", label: "Stanco", icon: BatteryLow, banner: "Ho ridotto il volume del 15% per oggi." },
  { key: "poco-tempo", label: "Poco tempo", icon: Clock, banner: "Ho accorciato la sessione a circa 20 minuti." },
];

/**
 * Prompt "Come ti senti oggi?" della Home (Fase 5). Alla scelta mostra un
 * banner di adattamento. Nota: il ricalcolo reale del workout è lato server
 * (feature successiva); qui la selezione è indicativa e locale.
 */
export function MoodPrompt() {
  const [sel, setSel] = useState<string | null>(null);
  const current = MOODS.find((m) => m.key === sel);

  return (
    <div className="bg-card border border-border rounded-[22px] p-5">
      <p className="text-sm font-semibold mb-3">Come ti senti oggi?</p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((m) => {
          const Icon = m.icon;
          const active = sel === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setSel(m.key)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-colors",
                active ? "border-transparent text-white" : "border-border text-muted-foreground hover:border-foreground"
              )}
              style={active ? { background: "var(--primary)" } : undefined}
              aria-pressed={active}
            >
              <Icon className="w-5 h-5" />
              {m.label}
            </button>
          );
        })}
      </div>
      {current && (
        <div
          className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-xl text-sm"
          style={{ background: "rgba(15,158,153,.10)", color: "var(--organic-green-deep)" }}
        >
          <Check className="w-4 h-4 shrink-0" />
          {current.banner}
        </div>
      )}
    </div>
  );
}
