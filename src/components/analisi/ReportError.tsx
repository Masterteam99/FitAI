"use client";

import React from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ReportErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function ReportError({ message = "Si è verificato un errore durante l'analisi.", onRetry }: ReportErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-red-500/30 bg-red-500/5">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Analisi Fallita</h2>
          <p className="text-muted-foreground mb-8">{message}</p>
          
          <div className="flex flex-col gap-3 w-full">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                Riprova l'analisi
              </Button>
            )}
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna alla dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
