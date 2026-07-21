"use client";

import { useState } from "react";
import Link from "next/link";
import { ARTICLES, ARTICLE_CATEGORIES } from "@/content/articles";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils";

export function ArticlesGrid() {
  const [cat, setCat] = useState<string>("all");
  const items = cat === "all" ? ARTICLES : ARTICLES.filter((a) => a.category === cat);

  const pill = (active: boolean) =>
    cn(
      "px-4 py-2 rounded-full text-sm font-semibold transition-colors border",
      active ? "text-white border-transparent" : "text-muted-foreground border-border hover:border-foreground"
    );

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button className={pill(cat === "all")} style={cat === "all" ? { background: "var(--organic-espresso)" } : undefined} onClick={() => setCat("all")}>
          {copy.risorse.allLabel}
        </button>
        {ARTICLE_CATEGORIES.map((k) => (
          <button key={k} className={pill(cat === k)} style={cat === k ? { background: "var(--organic-espresso)" } : undefined} onClick={() => setCat(k)}>
            {k}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">{copy.risorse.emptyCategory}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
            <Link key={a.slug} href={`/risorse/${a.slug}`} className="group block h-full">
              <article className="bg-card border border-border rounded-[22px] p-7 h-full flex flex-col transition-all hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-28px_rgba(22,33,62,.28)]">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--organic-green-deep)" }}>
                  {a.category}
                </span>
                <h3 className="font-display text-xl mt-2 mb-3 transition-opacity group-hover:opacity-80">{a.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">{a.excerpt}</p>
                <span className="text-xs text-muted-foreground">{a.readingMin} {copy.risorse.readingSuffix}</span>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
