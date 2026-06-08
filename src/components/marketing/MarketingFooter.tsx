import Link from "next/link";
import { Zap } from "lucide-react";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Prodotto",
    links: [
      { href: "/funzionalita", label: "Funzionalità" },
      { href: "/come-funziona", label: "Come funziona" },
      { href: "/prezzi", label: "Prezzi" },
    ],
  },
  {
    title: "Azienda",
    links: [
      { href: "/chi-siamo", label: "Chi siamo" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Inizia",
    links: [
      { href: "/registrati", label: "Crea account" },
      { href: "/login", label: "Accedi" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">FitAI</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Il tuo personal trainer AI: piani su misura, analisi video della tecnica e un coach disponibile 24/7.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title} className="space-y-3">
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 FitAI — Allenati più intelligente</p>
      </div>
    </footer>
  );
}
