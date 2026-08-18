"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronUp } from "lucide-react";
import { copy } from "@/content/copy";

type Params = { muscolo?: string; difficolta?: string; cerca?: string; tag?: string; attrezzatura?: string };

export function ExerciseFilters({
  params,
  muscleGroups,
  difficulties,
  equipmentOptions,
  allTags,
}: {
  params: Params;
  muscleGroups: [string, string][];
  difficulties: [string, string][];
  equipmentOptions: [string, string][];
  allTags: string[];
}) {
  const c = copy.esercizi;
  const [showMore, setShowMore] = useState(false);
  const hasSecondaryActive = !!(params.difficolta || params.attrezzatura || params.tag);

  function buildHref(overrides: Partial<Params>) {
    const next = { ...params, ...overrides };
    const qs = new URLSearchParams();
    if (next.cerca) qs.set("cerca", next.cerca);
    if (next.muscolo) qs.set("muscolo", next.muscolo);
    if (next.difficolta) qs.set("difficolta", next.difficolta);
    if (next.tag) qs.set("tag", next.tag);
    if (next.attrezzatura) qs.set("attrezzatura", next.attrezzatura);
    const s = qs.toString();
    return s ? `/esercizi?${s}` : "/esercizi";
  }

  return (
    <div className="flex flex-wrap gap-3">
      <form className="relative flex-1 min-w-48 max-w-xs">
        {params.muscolo && <input type="hidden" name="muscolo" value={params.muscolo} />}
        {params.difficolta && <input type="hidden" name="difficolta" value={params.difficolta} />}
        {params.tag && <input type="hidden" name="tag" value={params.tag} />}
        {params.attrezzatura && <input type="hidden" name="attrezzatura" value={params.attrezzatura} />}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          name="cerca"
          defaultValue={params.cerca}
          placeholder={c.searchPlaceholder}
          className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <Link href={buildHref({ muscolo: undefined })} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!params.muscolo ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
          {c.allFilter}
        </Link>
        {muscleGroups.map(([key, label]) => (
          <Link key={key} href={buildHref({ muscolo: params.muscolo === key ? undefined : key })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.muscolo === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
            {label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${hasSecondaryActive ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
      >
        {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
        {c.moreFilters}
        {hasSecondaryActive && !showMore && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </button>

      {showMore && (
        <>
          <div className="w-full flex flex-wrap gap-2">
            {difficulties.map(([key, label]) => (
              <Link key={key} href={buildHref({ difficolta: params.difficolta === key ? undefined : key })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.difficolta === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {equipmentOptions.map(([key, label]) => (
              <Link key={key} href={buildHref({ attrezzatura: params.attrezzatura === key ? undefined : key })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.attrezzatura === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
                {label}
              </Link>
            ))}
          </div>

          {allTags.length > 0 && (
            <div className="w-full flex flex-wrap gap-2">
              {allTags.map((t) => (
                <Link key={t} href={buildHref({ tag: params.tag === t ? undefined : t })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.tag === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
