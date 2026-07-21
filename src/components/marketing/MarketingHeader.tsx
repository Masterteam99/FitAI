import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { copy } from "@/content/copy";
import { OrganicLogo } from "./OrganicLogo";

const NAV = copy.marketingHeader.nav;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 backdrop-blur-md" style={{ background: "rgba(244,247,251,.85)" }}>
      <div className="max-w-[1180px] mx-auto px-7 py-5 flex items-center justify-between">
        <OrganicLogo />

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold border border-border hover:border-foreground transition-colors"
          >
            {copy.marketingHeader.login}
          </Link>
          <Link
            href="/registrati"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(233,69,96,.55)]"
            style={{ background: "var(--organic-terracotta)" }}
          >
            {copy.marketingHeader.signup} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
