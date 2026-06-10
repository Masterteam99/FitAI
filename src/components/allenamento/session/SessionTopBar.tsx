"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { copy } from "@/content/copy";

export function SessionTopBar({ planId, currentIndex, total, progressPct }: {
  planId: string;
  currentIndex: number;
  total: number;
  progressPct: number;
}) {
  return (
    <div className="relative z-10 flex items-center justify-between p-4 lg:p-6">
      <Link href={`/allenamento/${planId}`}>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" /> {copy.allenamentoSessione.exit}
        </Button>
      </Link>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground tabular-nums">
          {currentIndex + 1} / {total}
        </span>
        <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-energy"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-muted-foreground tabular-nums w-8">{progressPct}%</span>
      </div>
    </div>
  );
}
