"use client";

import { Brain, Loader2, TrendingUp } from "lucide-react";
import AnalysisProgress from "@/components/analisi/AnalysisProgress";
import { copy } from "@/content/copy";

export function AnalysisProcessingView({ uploading, analysisStep }: {
  uploading: boolean;
  analysisStep: number;
}) {
  return (
    <div className="py-12 px-4 max-w-3xl mx-auto flex flex-col items-center gap-8">
      <h2 className="text-2xl font-bold text-center">
        {uploading ? copy.analisiSessione.uploadingTitle : copy.analisiSessione.analyzingTitle}
      </h2>
      <AnalysisProgress
        steps={[
          { label: copy.analisiSessione.steps.upload, icon: <Loader2 className="w-5 h-5" /> },
          { label: copy.analisiSessione.steps.layers, icon: <Brain className="w-5 h-5" /> },
          { label: copy.analisiSessione.steps.synthesis, icon: <TrendingUp className="w-5 h-5" /> },
        ]}
        currentStep={uploading ? 0 : analysisStep}
      />
      <p className="mt-12 text-muted-foreground text-center text-sm">
        {uploading
          ? copy.analisiSessione.uploadingDesc
          : copy.analisiSessione.analyzingDesc}
      </p>
    </div>
  );
}
