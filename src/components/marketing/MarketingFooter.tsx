import Link from "next/link";
import { copy } from "@/content/copy";
import { OrganicLogo } from "./OrganicLogo";

const COLUMNS = copy.marketingFooter.columns;

export function MarketingFooter() {
  return (
    <footer className="relative" style={{ background: "var(--organic-espresso)", color: "rgba(232,241,226,.7)" }}>
      <div className="max-w-[1180px] mx-auto px-7 pt-16 pb-24 md:pb-9">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] mb-12">
          <div className="space-y-4" style={{ color: "var(--organic-sand)" }}>
            <OrganicLogo dark />
            <p className="text-sm max-w-xs" style={{ color: "rgba(232,241,226,.7)" }}>
              {copy.marketingFooter.description}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-[0.14em] mb-4" style={{ color: "var(--organic-sand)" }}>
                {col.title}
              </h4>
              <ul className="space-y-1 text-sm">
                {col.links.map((l) => (
                  <li key={l.href} className="py-1">
                    <Link href={l.href} className="transition-colors hover:text-[var(--organic-terracotta-soft)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(232,241,226,.12)" }}>
          <span className="text-sm">{copy.marketingFooter.copyright} · {copy.marketingFooter.piva}</span>
          <span
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(198,241,53,.12)", color: "var(--organic-green-soft)" }}
          >
            🔒 Dati elaborati sul tuo dispositivo
          </span>
          <span className="text-sm">{copy.marketingFooter.tagline}</span>
        </div>
      </div>

      {/* Barra CTA fissa su mobile (brief §2.3) */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 border-t backdrop-blur-md"
        style={{ background: "rgba(244,247,251,.92)", borderColor: "var(--border)" }}
      >
        <Link
          href="/registrati"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-semibold text-sm text-white"
          style={{ background: "var(--organic-terracotta)" }}
        >
          Prova Gratis — Calcola il tuo piano
        </Link>
      </div>
    </footer>
  );
}
