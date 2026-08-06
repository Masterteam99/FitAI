import { FormScoreHero } from "@/components/dashboard/FormScoreHero";
import { MoodPrompt } from "@/components/dashboard/MoodPrompt";
import { AnimatedBars, AdaptiveBodyMap } from "@/components/wow";
import { StreakHeatmap } from "@/components/visualizations/StreakHeatmap";

// PREVIEW TEMPORANEA (pubblica, dati finti) per verificare lo stile navy/coral
// della dashboard senza login. Da rimuovere dopo l'integrazione reale.
export const metadata = { title: "Anteprima dashboard", robots: { index: false } };

const streakMock = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.now() - (89 - i) * 86400000);
  return { date: d.toISOString().slice(0, 10), count: Math.random() > 0.45 ? 1 : 0 };
});

export default function AnteprimaDashboard() {
  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="theme-organic min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{today}</p>
            <h1 className="font-display text-3xl mt-1">Bentornato, Marco</h1>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full" style={{ background: "rgba(233,69,96,.10)", color: "var(--organic-terracotta)" }}>
            🔥 14 giorni streak
          </span>
        </div>

        {/* Come ti senti oggi? */}
        <MoodPrompt />

        {/* Hero Form Score */}
        <FormScoreHero
          exercise="Squat"
          contextLabel="ultima analisi"
          score={87}
          verdict="Ottima esecuzione"
          note="+5 punti rispetto alla sessione precedente. Lavora sull'allineamento delle ginocchia."
          correction="Ginocchia in avanti — sposta il peso sui talloni"
          stats={[
            { label: "Profondità", value: "92%" },
            { label: "Rischio infortuni", value: "Medio" },
            { label: "Tempo medio rep", value: "2,4s" },
            { label: "Ripetizioni", value: "6/12" },
          ]}
        />

        {/* Griglia di supporto */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-[22px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">Volume allenamento</h2>
              <span className="text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>+18% questo mese</span>
            </div>
            <AnimatedBars
              color="#e94560"
              data={[
                { label: "Set 1", value: 62 },
                { label: "Set 2", value: 74 },
                { label: "Set 3", value: 68 },
                { label: "Set 4", value: 88 },
                { label: "Set 5", value: 81 },
                { label: "Set 6", value: 96 },
              ]}
            />
          </div>

          <div className="bg-card border border-border rounded-[22px] p-6">
            <h2 className="font-display text-lg mb-4">Equilibrio muscolare</h2>
            <div className="max-w-[190px] mx-auto">
              <AdaptiveBodyMap
                mode="balance"
                showToggle={false}
                view="front"
                data={[
                  { muscle: "QUADRICEPS", deficitPct: 66 },
                  { muscle: "CALVES", deficitPct: 58 },
                  { muscle: "BICEPS", deficitPct: 52 },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Costanza */}
        <div className="bg-card border border-border rounded-[22px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg">Costanza</h2>
            <span className="text-sm text-muted-foreground">28 sessioni · ultime 4 settimane</span>
          </div>
          <StreakHeatmap data={streakMock} days={90} cellSize={12} cellGap={3} />
        </div>
      </div>
    </div>
  );
}
