import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { RadialGauge } from "@/components/wow";

export interface FormScoreHeroProps {
  exercise: string;
  contextLabel?: string; // es. "ultima analisi" / "serie 2"
  score: number; // 0-100
  verdict: string; // es. "Ottima esecuzione"
  note?: string; // es. "+5 punti rispetto alla sessione precedente"
  correction?: string; // es. "Ginocchia in avanti — sposta il peso sui talloni"
  stats: { label: string; value: string }[];
  href?: string;
  ctaLabel?: string;
  emptyLabel?: string; // mostrato se non c'è ancora un'analisi
}

/**
 * Card protagonista della dashboard (struttura del mockup "Analisi in tempo
 * reale"), stilata navy/coral Motion Insight. Mostra il Form Score dell'ultima
 * analisi con verdetto, correzione prioritaria e le metriche chiave.
 */
export function FormScoreHero(props: FormScoreHeroProps) {
  const { exercise, contextLabel, score, verdict, note, correction, stats, href = "/analisi", ctaLabel = "Nuova analisi", emptyLabel } = props;

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-7 md:p-9"
      style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}
    >
      <div
        className="pointer-events-none absolute w-80 h-80 rounded-full blur-[80px] -top-32 -right-16 opacity-25"
        style={{ background: "var(--organic-terracotta)" }}
      />

      <div className="relative z-[2] flex items-center justify-between mb-6">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: "var(--organic-terracotta-soft)" }}>
          <Activity className="w-4 h-4" />
          Analisi della forma
        </span>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--organic-terracotta)" }}
        >
          {ctaLabel} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {emptyLabel ? (
        <div className="relative z-[2] py-10 text-center" style={{ color: "rgba(234,241,248,.72)" }}>
          {emptyLabel}
        </div>
      ) : (
        <div className="relative z-[2]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <RadialGauge value={score} max={100} size={132} color="#e94560" label="forma" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display text-2xl">{exercise}</h3>
                {contextLabel && <span className="text-xs" style={{ color: "rgba(234,241,248,.6)" }}>· {contextLabel}</span>}
              </div>
              <p className="font-display text-xl mt-1" style={{ color: "var(--organic-green-soft)" }}>{verdict}</p>
              {note && <p className="text-sm mt-2" style={{ color: "rgba(234,241,248,.72)" }}>{note}</p>}
              {correction && (
                <p
                  className="inline-flex items-center gap-2 text-sm mt-3 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(233,69,96,.16)", color: "#ffd7de" }}
                >
                  ⚠ {correction}
                </p>
              )}
            </div>
          </div>

          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(234,241,248,.06)" }}>
                  <div className="font-display text-2xl" style={{ color: "var(--organic-sand)" }}>{s.value}</div>
                  <div className="text-[11px] uppercase tracking-[0.12em] mt-1" style={{ color: "rgba(234,241,248,.6)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
