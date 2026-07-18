"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Brain, TrendingUp } from "lucide-react";
import type { L1Result, L2Result, L3Result } from "@/types/analysis";

type Tab = "L1" | "L2" | "L3";

interface Props {
  l1: L1Result | null;
  l2: L2Result | null;
  l3: L3Result | null;
}

export default function AnalysisDetails({ l1, l2, l3 }: Props) {
  const [tab, setTab] = useState<Tab>("L1");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: "L1", label: "Biomeccanica", icon: <Target className="w-4 h-4" />, color: "text-blue-400" },
    { id: "L2", label: "PT Vision", icon: <Brain className="w-4 h-4" />, color: "text-primary" },
    { id: "L3", label: "Confronto PT", icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-400" },
  ];

  return (
    <details className="group">
      <summary className="cursor-pointer list-none flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
        <span className="font-semibold text-sm">Dettagli tecnici (L1/L2/L3)</span>
        <span className="text-xs text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
      </summary>

      <div className="mt-3 space-y-3">
        <div className="flex gap-1 p-1 bg-muted/40 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                tab === t.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className={tab === t.id ? t.color : ""}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="p-4 space-y-3 text-sm">
            {tab === "L1" && (l1 ? <L1Section l1={l1} /> : <Empty />)}
            {tab === "L2" && (l2 ? <L2Section l2={l2} /> : <Empty />)}
            {tab === "L3" && (l3 ? <L3Section l3={l3} /> : <Empty />)}
          </CardContent>
        </Card>
      </div>
    </details>
  );
}

function Empty() {
  return <p className="text-muted-foreground text-xs italic">Dati non disponibili per questa analisi.</p>;
}

function L1Section({ l1 }: { l1: L1Result }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{Math.round(l1.score)}</span>
        <span className="text-xs text-muted-foreground">score biomeccanico</span>
      </div>
      {l1.detectedPhases.length > 0 && (
        <div className="text-xs">
          <span className="text-muted-foreground">Fasi rilevate: </span>
          {l1.detectedPhases.map((p, i) => (
            <span key={i} className="inline-block mr-2">
              {p.phase} <span className="text-muted-foreground/60">({p.durationFrames}f)</span>
            </span>
          ))}
        </div>
      )}
      {l1.triggeredFeedback.length > 0 ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Trigger attivati:</p>
          {l1.triggeredFeedback.map((t, i) => (
            <div
              key={i}
              className={`flex gap-2 p-2 rounded-md text-xs ${
                t.severity === "CRITICAL"
                  ? "bg-red-500/10 border border-red-500/30"
                  : t.severity === "ERROR"
                  ? "bg-orange-500/10 border border-orange-500/30"
                  : "bg-yellow-500/10 border border-yellow-500/30"
              }`}
            >
              <span className="font-mono shrink-0">{t.severity}</span>
              <span>{t.feedback}</span>
              {t.injuryRisk && <span className="text-red-400 shrink-0">⚠</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-green-400">Nessun trigger attivato — esecuzione dentro il range.</p>
      )}
    </div>
  );
}

function L2Section({ l2 }: { l2: L2Result }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{Math.round(l2.score)}</span>
        <span className="text-xs text-muted-foreground">score PT vision</span>
      </div>
      {l2.qualitativeAnalysis && <p className="leading-relaxed">{l2.qualitativeAnalysis}</p>}
      {l2.visualObservations.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Osservazioni visive:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {l2.visualObservations.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}
      {l2.injuryRiskFlags.length > 0 && (
        <div>
          <p className="text-xs text-red-400 mb-1">Flag rischio:</p>
          <ul className="list-disc list-inside space-y-0.5 text-xs">
            {l2.injuryRiskFlags.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function L3Section({ l3 }: { l3: L3Result }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{Math.round(l3.score)}</span>
        <span className="text-xs text-muted-foreground">score confronto PT</span>
        {typeof l3.numericScore === "number" && (
          <span className="ml-auto text-xs text-muted-foreground">
            aderenza biomeccanica al PT: <span className="font-semibold text-foreground">{l3.numericScore}%</span>
          </span>
        )}
      </div>
      {l3.comparisonFeedback && <p className="leading-relaxed">{l3.comparisonFeedback}</p>}
      {l3.keyDifferences.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Differenze chiave:</p>
          {l3.keyDifferences.map((d, i) => (
            <div key={i} className="grid grid-cols-[minmax(110px,auto)_1fr_1fr] gap-2 text-xs p-2 rounded bg-muted/40">
              <span className="font-medium">{d.aspect}</span>
              <span><span className="text-muted-foreground">tu:</span> {d.user}</span>
              <span><span className="text-muted-foreground">PT:</span> {d.pro}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
