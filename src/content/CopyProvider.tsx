"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copy as baseCopy } from "@/content/copy";
import { applyOverrides, type Overrides } from "@/lib/site-content";

type Copy = typeof baseCopy;

const CopyContext = createContext<Copy>(baseCopy);

// Restituisce i copy con gli override del gestore applicati (se presenti).
// I componenti non ancora migrati continuano a usare l'import statico `copy`.
export function useCopy(): Copy {
  return useContext(CopyContext);
}

export function CopyProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Overrides | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/site-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.overrides && typeof d.overrides === "object") setOverrides(d.overrides as Overrides);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => (overrides && Object.keys(overrides).length ? applyOverrides(baseCopy, overrides) : baseCopy),
    [overrides],
  );

  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}
