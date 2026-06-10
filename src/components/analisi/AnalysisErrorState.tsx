"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";

export function AnalysisErrorState({ title, message, onRetry }: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={cn("text-center py-16 space-y-4", onRetry && "max-w-md mx-auto")}>
      <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <p className="text-muted-foreground text-sm">{message}</p>
      <div className="flex justify-center gap-2">
        {onRetry ? (
          <>
            <Button onClick={onRetry}>{copy.analisiSessione.retry}</Button>
            <Link href="/analisi"><Button variant="outline">{copy.analisiSessione.exit}</Button></Link>
          </>
        ) : (
          <Link href="/analisi"><Button>{copy.analisiSessione.backToExercises}</Button></Link>
        )}
      </div>
    </div>
  );
}
