import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight } from "lucide-react";

const NAV = [
  { href: "/funzionalita", label: "Funzionalità" },
  { href: "/come-funziona", label: "Come funziona" },
  { href: "/prezzi", label: "Prezzi" },
  { href: "/chi-siamo", label: "Chi siamo" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader() {
  return (
    <header className="relative border-b border-border px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-primary">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-display">FitAI</span>
      </Link>

      <nav className="hidden md:flex items-center gap-6 text-sm">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="text-muted-foreground hover:text-foreground transition-colors">
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link href="/login"><Button variant="ghost">Accedi</Button></Link>
        <Link href="/registrati"><Button className="glow-energy">Inizia gratis <ChevronRight className="w-4 h-4" /></Button></Link>
      </div>
    </header>
  );
}
