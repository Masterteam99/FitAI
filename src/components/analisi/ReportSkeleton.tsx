import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, AlertTriangle, CheckCircle } from "lucide-react";

export default function ReportSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 bg-muted rounded"></div>
      </div>

      <div>
        <div className="h-8 w-64 bg-muted rounded mb-2"></div>
        <div className="h-4 w-48 bg-muted rounded"></div>
      </div>

      {/* Hero score */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-6 text-center">
          <div className="w-24 h-24 mx-auto bg-muted rounded-full mb-4"></div>
          <div className="h-6 w-32 mx-auto bg-muted rounded mt-2"></div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card/60 rounded-xl p-3">
                <div className="w-8 h-8 mx-auto bg-muted rounded-full mb-2"></div>
                <div className="h-6 w-16 mx-auto bg-muted rounded mb-1"></div>
                <div className="h-3 w-20 mx-auto bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Giudizio del Coach */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-muted" />
            <div className="h-5 w-40 bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 w-full bg-muted rounded"></div>
          <div className="h-4 w-11/12 bg-muted rounded"></div>
          <div className="h-4 w-4/5 bg-muted rounded"></div>
        </CardContent>
      </Card>

      {/* Aree di miglioramento */}
      <Card className="border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-muted" />
            <div className="h-5 w-48 bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <div className="h-4 w-4 bg-muted rounded shrink-0"></div>
              <div className="h-4 w-full bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Punti di forza */}
      <Card className="border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-muted" />
            <div className="h-5 w-40 bg-muted rounded"></div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="h-4 w-4 bg-muted rounded-full shrink-0"></div>
              <div className="h-4 w-10/12 bg-muted rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
