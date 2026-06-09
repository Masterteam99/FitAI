import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { scoreToLabel } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Brain, Target, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import type { FinalReport, L1Result, L2Result, L3Result } from "@/types/analysis";
import ReportError from "@/components/analisi/ReportError";
import AnalysisProgress from "@/components/analisi/AnalysisProgress";
import AnalysisDetails from "@/components/analisi/AnalysisDetails";
import VideoSyncPlayer from "@/components/analisi/VideoSyncPlayer";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.analisiReport.meta.title };

interface Props { params: Promise<{ id: string }> }

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const report = await prisma.analysisSession.findFirst({
    where: { id, userId: session!.user!.id as string },
    include: { exercise: { select: { name: true, slug: true, videoUrl: true } } },
  });
  if (!report) notFound();

  if (report.status === "ERROR") {
    return <ReportError message={copy.analisiReport.errorMessage} />;
  }

  if (report.status === "PROCESSING" || report.status === "RECORDING") {
    return (
      <div className="py-12 px-4 max-w-3xl mx-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-12">{copy.analisiReport.processingTitle}</h2>
        <AnalysisProgress
          steps={[
            { label: copy.analisiReport.steps.l1, icon: <Target className="w-5 h-5" /> },
            { label: copy.analisiReport.steps.l2, icon: <Brain className="w-5 h-5" /> },
            { label: copy.analisiReport.steps.l3, icon: <TrendingUp className="w-5 h-5" /> }
          ]}
          currentStep={1}
        />
        <p className="mt-12 text-muted-foreground text-center">
          {copy.analisiReport.processingDesc}
        </p>
        <div className="mt-8">
          <Link href="/dashboard">
            <Button variant="outline">{copy.analisiReport.backToDashboard}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const parseJson = <T,>(v: unknown): T | null =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as T) : null;
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

  // SVG ring math: cerchio r=45, circumference = 2π·45 ≈ 282.74
  const ringCircumference = 282.74;
  const ringDashOffset = ringCircumference * (1 - combined / 100);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/analisi"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{copy.analisiReport.newAnalysis}</Button></Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{copy.analisiReport.reportTitle(report.exercise.name)}</h1>
        <p className="text-muted-foreground">{copy.analisiReport.completedOn(new Date(report.completedAt!).toLocaleDateString("it-IT"))}</p>
      </div>

      {/* Score principale con anello SVG */}
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

          <div className="grid grid-cols-3 gap-3 mt-6 w-full">
            {[
              { label: copy.analisiReport.scoreCards.biomechanics, score: bioScore, pct: "34%", icon: Target },
              { label: copy.analisiReport.scoreCards.ptVision, score: aiScore, pct: "33%", icon: Brain },
              { label: copy.analisiReport.scoreCards.ptComparison, score: videoScore, pct: "33%", icon: TrendingUp },
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

      {/* Alert sicurezza */}
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

      {/* Giudizio del Coach (overall) */}
      {finalReport?.overallJudgment && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" />{copy.analisiReport.coachJudgmentTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{finalReport.overallJudgment}</p>
          </CardContent>
        </Card>
      )}

      {/* Aree di miglioramento */}
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

      {/* Punti di forza */}
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

      {/* Feedback biomeccanico */}
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

      {/* Video confronto feedback */}
      {videoComparisonFeedback && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" />{copy.analisiReport.proComparisonTitle}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{videoComparisonFeedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Side-by-side video sync */}
      {(report.videoUrl || report.exercise.videoUrl) && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base">{copy.analisiReport.syncedVideosTitle}</CardTitle></CardHeader>
          <CardContent>
            <VideoSyncPlayer
              userVideoUrl={report.videoUrl}
              proVideoUrl={report.exercise.videoUrl ?? null}
            />
          </CardContent>
        </Card>
      )}

      {/* Dettagli tecnici L1/L2/L3 */}
      <AnalysisDetails l1={l1} l2={l2} l3={l3} />

      <div className="flex gap-3 pt-2">
        <Link href={`/analisi/sessione?id=${report.exerciseId}`} className="flex-1">
          <Button className="w-full">{copy.analisiReport.repeatAnalysis}</Button>
        </Link>
        <Link href="/analisi">
          <Button variant="outline">{copy.analisiReport.otherExercises}</Button>
        </Link>
      </div>
    </div>
  );
}
