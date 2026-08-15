import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Brain, Target, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import ReportError from "@/components/analisi/ReportError";
import AnalysisProgress from "@/components/analisi/AnalysisProgress";
import { AnalysisReportContent } from "@/components/analisi/AnalysisReportContent";
import { AnalysisReportActions } from "@/components/analisi/AnalysisReportActions";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.analisiReport.meta.title };

interface Props { params: Promise<{ id: string }>; searchParams: Promise<{ wsReturn?: string }> }

export default async function ReportPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { wsReturn: wsReturnRaw } = await searchParams;
  // Solo path interni relativi — evita redirect verso URL esterne arbitrarie.
  const wsReturn = wsReturnRaw && wsReturnRaw.startsWith("/") && !wsReturnRaw.startsWith("//") ? wsReturnRaw : null;
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/analisi"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" />{copy.analisiReport.newAnalysis}</Button></Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{copy.analisiReport.reportTitle(report.exercise.name)}</h1>
        <p className="text-muted-foreground">{copy.analisiReport.completedOn(new Date(report.completedAt!).toLocaleDateString("it-IT"))}</p>
      </div>

      <AnalysisReportContent
        report={{
          exerciseName: report.exercise.name,
          exerciseSlug: report.exercise.slug,
          exerciseVideoUrl: report.exercise.videoUrl,
          videoUrl: report.videoUrl,
          l1Result: report.l1Result,
          l2Result: report.l2Result,
          l3Result: report.l3Result,
          finalReport: report.finalReport,
          combinedScore: report.combinedScore,
        }}
      />

      <AnalysisReportActions exerciseId={report.exerciseId} wsReturn={wsReturn} />
    </div>
  );
}
