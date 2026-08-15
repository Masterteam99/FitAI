import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { scoreToLabel } from "@/lib/utils";
import { CheckCircle, AlertTriangle, TrendingUp, Brain, Target, ShieldAlert } from "lucide-react";
import type { FinalReport, L1Result, L2Result, L3Result } from "@/types/analysis";
import AnalysisDetails from "@/components/analisi/AnalysisDetails";
import VideoSyncPlayer from "@/components/analisi/VideoSyncPlayer";
import { ExerciseFormPlayer, exerciseToArchetype, inferErrorMarker, JOINT_LABEL } from "@/components/wow";
import { copy } from "@/content/copy";

export interface AnalysisReportData {
  exerciseName: string;
  exerciseSlug: string;
  exerciseVideoUrl: string | null;
  videoUrl: string | null;
  l1Result: unknown;
  l2Result: unknown;
  l3Result: unknown;
  finalReport: unknown;
  combinedScore: number | null;
}

function parseJson<T>(v: unknown): T | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as T) : null;
}

/**
 * Corpo del report di analisi (punteggio, tecnica ricostruita, alert, feedback, video confronto).
 * Condiviso tra la pagina standalone `/analisi/report/[id]` e il flusso inline della sessione
 * guidata, così il risultato non richiede una navigazione separata per essere mostrato lì dove
 * l'utente sta già lavorando.
 */
export function AnalysisReportContent({ report }: { report: AnalysisReportData }) {
  const finalReport = parseJson<FinalReport>(report.finalReport);
  const l1 = parseJson<L1Result>(report.l1Result);
  const l2 = parseJson<L2Result>(report.l2Result);
  const l3 = parseJson<L3Result>(report.l3Result);

  const bioScore = Math.round(l1?.score ?? 0);
  const aiScore = Math.round(l2?.score ?? 0);
  const videoScore = Math.round(l3?.score ?? 0);
  const combined = Math.round(finalReport?.combinedScore ?? report.combinedScore ?? 0);

  const { label: combinedLabel, color: combinedColor } = scoreToLabel(combined);
  const bioFeedback = l1?.triggeredFeedback.map((t) => t.feedback) ?? [];
  const improvementAreas = finalReport?.prioritizedImprovements ?? [];
  const positiveAspects = finalReport?.positiveAspects ?? [];
  const videoComparisonFeedback = l3?.comparisonFeedback ?? null;
  const injuryAlert = finalReport?.injuryRiskAlert;
  const showInjuryAlert = injuryAlert && injuryAlert.level !== "BASSO";

  const archetype = exerciseToArchetype({ slug: report.exerciseSlug, name: report.exerciseName });
  const formMarker = inferErrorMarker([
    ...improvementAreas,
    ...bioFeedback,
    ...(injuryAlert?.affectedAreas ?? []),
  ]);

  const ringCircumference = 282.74;
  const ringDashOffset = ringCircumference * (1 - combined / 100);

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="relative w-44 h-44 mb-3">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6" className="stroke-muted/30" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringDashOffset}
                className={`stroke-current transition-all ${combinedColor}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold ${combinedColor}`}>{combined}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{copy.analisiReport.outOf100}</div>
            </div>
          </div>
          <div className={`text-xl font-semibold ${combinedColor}`}>{combinedLabel}</div>
          <p className="text-sm text-muted-foreground mt-1">{copy.analisiReport.overallScore}</p>

          {/* Pesi reali da src/services/analysis/weights.ts (fonte di verità):
              con video PT 50/30/20, senza 62.5/37.5/0 (L3 ridistribuito). */}
          <div className="grid grid-cols-3 gap-3 mt-6 w-full">
            {[
              { label: copy.analisiReport.scoreCards.biomechanics, score: bioScore, pct: l3 ? "50%" : "62,5%", icon: Target },
              { label: copy.analisiReport.scoreCards.ptVision, score: aiScore, pct: l3 ? "30%" : "37,5%", icon: Brain },
              { label: copy.analisiReport.scoreCards.ptComparison, score: videoScore, pct: l3 ? "20%" : "—", icon: TrendingUp },
            ].map((s) => {
              const Icon = s.icon;
              const { color } = scoreToLabel(s.score);
              return (
                <div key={s.label} className="bg-card/60 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                  <div className={`text-2xl font-bold ${color}`}>{s.score}</div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground opacity-60">{s.pct}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {archetype && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-5 h-5 text-primary" />
              Tecnica ricostruita
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <ExerciseFormPlayer
              archetype={archetype}
              error={formMarker?.key}
              showError={!!formMarker}
              errorNote={formMarker ? JOINT_LABEL[formMarker.key] : undefined}
              size={180}
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {formMarker
                ? `Punto critico rilevato sul ${JOINT_LABEL[formMarker.key]}: ${formMarker.note}`
                : "Esecuzione ricostruita dal tuo video. Nessun errore maggiore evidenziato sul movimento."}
            </p>
          </CardContent>
        </Card>
      )}

      {showInjuryAlert && injuryAlert && (
        <Card className={`border-2 ${injuryAlert.level === "ALTO" ? "border-red-500/60 bg-red-500/10" : "border-orange-500/50 bg-orange-500/5"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              {copy.analisiReport.safetyAlert(injuryAlert.level)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm leading-relaxed">{injuryAlert.explanation}</p>
            {injuryAlert.affectedAreas.length > 0 && (
              <p className="text-xs text-muted-foreground">{copy.analisiReport.affectedAreas(injuryAlert.affectedAreas.join(", "))}</p>
            )}
          </CardContent>
        </Card>
      )}

      {finalReport?.overallJudgment && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />{copy.analisiReport.coachJudgmentTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{finalReport.overallJudgment}</p>
          </CardContent>
        </Card>
      )}

      {improvementAreas.length > 0 && (
        <Card className="border-yellow-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-yellow-400"><AlertTriangle className="w-5 h-5" />{copy.analisiReport.improvementAreasTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {improvementAreas.map((area, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <span className="text-yellow-400 font-bold text-sm shrink-0">{i + 1}.</span>
                <p className="text-sm">{area}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {positiveAspects.length > 0 && (
        <Card className="border-green-500/20">
          <CardHeader><CardTitle className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />{copy.analisiReport.strengthsTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {positiveAspects.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm">{p}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {bioFeedback.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-blue-400" />{copy.analisiReport.biomechanicalFeedbackTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {bioFeedback.map((f, i) => (
              <div key={i} className="flex gap-2 items-start p-2 rounded-lg bg-blue-500/5">
                <span className="text-blue-400 text-sm">•</span>
                <p className="text-sm">{f}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {videoComparisonFeedback && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" />{copy.analisiReport.proComparisonTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{videoComparisonFeedback}</p>
          </CardContent>
        </Card>
      )}

      {(report.videoUrl || report.exerciseVideoUrl) && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base">{copy.analisiReport.syncedVideosTitle}</CardTitle></CardHeader>
          <CardContent>
            <VideoSyncPlayer
              userVideoUrl={report.videoUrl}
              proVideoUrl={report.exerciseVideoUrl}
            />
          </CardContent>
        </Card>
      )}

      <AnalysisDetails l1={l1} l2={l2} l3={l3} />
    </div>
  );
}
