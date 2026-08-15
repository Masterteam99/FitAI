import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { copy } from "@/content/copy";

export function AnalysisReportActions({ exerciseId, wsReturn }: { exerciseId: string; wsReturn?: string | null }) {
  if (wsReturn) {
    return (
      <div className="flex gap-3 pt-2 flex-wrap">
        <Link href={wsReturn} className="flex-1 min-w-[200px]">
          <Button className="w-full gap-2">
            {copy.analisiReport.backToSession}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href={`/analisi/sessione?id=${exerciseId}`}>
          <Button variant="outline">{copy.analisiReport.repeatAnalysis}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex gap-3 pt-2 flex-wrap">
      <Link href={`/analisi/sessione?id=${exerciseId}`} className="flex-1">
        <Button className="w-full">{copy.analisiReport.repeatAnalysis}</Button>
      </Link>
      <Link href="/analisi">
        <Button variant="outline">{copy.analisiReport.otherExercises}</Button>
      </Link>
    </div>
  );
}
