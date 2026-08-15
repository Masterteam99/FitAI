"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink, Apple, AlertTriangle } from "lucide-react";
import { copy } from "@/content/copy";

interface DocAnalysis {
  summary: string;
  nutritionAdjustments: string[];
  cautions: string[];
}

export interface ProfessionalDoc {
  id: string;
  name: string;
  url: string | null;
  analysis: DocAnalysis;
}

export function ProfessionalPlanCard({ doc }: { doc: ProfessionalDoc }) {
  const c = copy.nutrizione.professionalPlan;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {c.title}
          </CardTitle>
          {doc.url && (
            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0">
              {doc.name} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{c.subtitle}</p>
        {doc.analysis.summary && <p className="text-sm">{doc.analysis.summary}</p>}
        {doc.analysis.nutritionAdjustments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1"><Apple className="w-3.5 h-3.5" />{c.adjustments}</p>
            <ul className="list-disc pl-5 space-y-0.5 text-sm text-muted-foreground">
              {doc.analysis.nutritionAdjustments.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
        {doc.analysis.cautions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1"><AlertTriangle className="w-3.5 h-3.5" />{c.cautions}</p>
            <ul className="list-disc pl-5 space-y-0.5 text-sm text-muted-foreground">
              {doc.analysis.cautions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
