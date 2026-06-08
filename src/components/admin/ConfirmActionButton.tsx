"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmActionButton({
  label,
  confirmLabel,
  onConfirm,
  tone = "default",
  disabled = false,
  className,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  tone?: "default" | "success" | "warning" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const toneClass = {
    default: "border-border text-foreground",
    success: "border-green-600 text-green-600",
    warning: "border-amber-600 text-amber-600",
    danger: "border-red-600 text-red-600",
  }[tone];

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className={cn("border", toneClass, className)}
          disabled={pending || disabled}
          onClick={() => startTransition(async () => { await onConfirm(); setConfirming(false); })}
        >
          {pending ? "..." : (confirmLabel ?? "Conferma")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Annulla
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("border", toneClass, className)}
      disabled={disabled}
      onClick={() => setConfirming(true)}
    >
      {label}
    </Button>
  );
}
