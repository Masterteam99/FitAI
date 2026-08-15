"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface FoodResult {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
}

export interface SelectedFoodEntry {
  foodId: string;
  foodName: string;
  grams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  cereali: "🌾",
  carne: "🍗",
  pesce: "🐟",
  uova_latticini: "🥚",
  legumi: "🫘",
  verdura: "🥦",
  frutta: "🍎",
  grassi_oli: "🫒",
  dolci_snack: "🍪",
  bevande: "🥤",
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

// Sostituisce l'inserimento manuale di calorie/proteine/carbo/grassi: l'utente
// cerca l'alimento e inserisce solo la grammatura, i macro si calcolano da soli
// dal pool alimenti (valori per 100g).
export function FoodSearchAutocomplete({ onChange }: { onChange: (v: SelectedFoodEntry | null) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/foods/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          setResults(d.items ?? []);
          setOpen(true);
        })
        .catch(() => {});
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected]);

  useEffect(() => {
    if (!selected) {
      onChange(null);
      return;
    }
    const g = Number(grams);
    if (!Number.isFinite(g) || g <= 0) {
      onChange(null);
      return;
    }
    onChange({
      foodId: selected.id,
      foodName: selected.name,
      grams: g,
      calories: Math.round((selected.caloriesPer100g * g) / 100),
      proteinG: round1((selected.proteinPer100g * g) / 100),
      carbsG: round1((selected.carbsPer100g * g) / 100),
      fatG: round1((selected.fatPer100g * g) / 100),
      fiberG: round1((selected.fiberPer100g * g) / 100),
    });
    // onChange intenzionalmente fuori dalle dipendenze: ricalcola solo quando
    // cambia la selezione o la grammatura, non a ogni re-render del genitore.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, grams]);

  function pick(f: FoodResult) {
    setSelected(f);
    setQuery(f.name);
    setOpen(false);
  }

  function clear() {
    setSelected(null);
    setQuery("");
    setGrams("100");
    setResults([]);
  }

  const g = Number(grams) || 0;
  const preview = selected
    ? {
        kcal: Math.round((selected.caloriesPer100g * g) / 100),
        protein: round1((selected.proteinPer100g * g) / 100),
        carbs: round1((selected.carbsPer100g * g) / 100),
        fat: round1((selected.fatPer100g * g) / 100),
      }
    : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9 pr-9"
          placeholder="Cerca un alimento…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          onFocus={() => results.length > 0 && !selected && setOpen(true)}
        />
        {selected && (
          <button
            type="button"
            onClick={clear}
            aria-label="Rimuovi alimento selezionato"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {open && !selected && results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
            {results.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => pick(f)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"
              >
                <span className="shrink-0">{CATEGORY_EMOJI[f.category] ?? "🍽️"}</span>
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{Math.round(f.caloriesPer100g)} kcal/100g</span>
              </button>
            ))}
          </div>
        )}
        {open && !selected && query.trim().length >= 2 && results.length === 0 && (
          <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-lg shadow-lg p-3 text-xs text-muted-foreground">
            Nessun alimento trovato.
          </div>
        )}
      </div>

      {selected && (
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-muted-foreground">Grammi</label>
            <Input type="number" inputMode="numeric" min={1} value={grams} onChange={(e) => setGrams(e.target.value)} className="w-24" />
          </div>
          {preview && (
            <p className="text-xs text-muted-foreground pb-2">
              {preview.kcal} kcal · P {preview.protein}g · C {preview.carbs}g · G {preview.fat}g
            </p>
          )}
        </div>
      )}
    </div>
  );
}
