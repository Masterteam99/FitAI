import Link from "next/link";
import { copy } from "@/content/copy";
import { OrganicLogo } from "./OrganicLogo";

const COLUMNS = copy.marketingFooter.columns;

export function MarketingFooter() {
  return (
    <footer className="relative" style={{ background: "var(--organic-espresso)", color: "rgba(232,241,226,.7)" }}>
      <div className="max-w-[1180px] mx-auto px-7 pt-16 pb-9">
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

        <div className="pt-6 text-sm flex flex-wrap justify-between gap-3" style={{ borderTop: "1px solid rgba(232,241,226,.12)" }}>
          <span>{copy.marketingFooter.copyright}</span>
          <span>{copy.marketingFooter.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
