"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, Dumbbell, PlayCircle, Brain, Apple, Users, TrendingUp, User, LogOut, Zap, Menu, X, Sparkles, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { APP_NAME, copy } from "@/content/copy";

const ICONS: Record<string, typeof LayoutDashboard> = {
  "/dashboard": LayoutDashboard,
  "/esercizi": Dumbbell,
  "/allenamento": PlayCircle,
  "/analisi": Brain,
  "/ai-coach": Zap,
  "/nutrizione": Apple,
  "/community": Users,
  "/progressi": TrendingUp,
  "/abbonamento": Sparkles,
};

const NAV_ITEMS = copy.navbar.items.map((i) => ({ ...i, icon: ICONS[i.href] }));

export function Navbar({ isAdmin, isPremium = false }: { isAdmin: boolean; isPremium?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = isAdmin
    ? [...NAV_ITEMS, { ...copy.navbar.admin, icon: ShieldCheck }]
    : NAV_ITEMS;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {!isPremium && (
            <Link
              href="/abbonamento"
              className="block rounded-xl p-4 mb-3 text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--organic-espresso)" }}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--organic-terracotta-soft)" }}>
                <Sparkles className="w-3.5 h-3.5" /> {copy.navbar.premium.title}
              </div>
              <p className="text-xs mb-3" style={{ color: "rgba(234,241,248,.78)" }}>{copy.navbar.premium.desc}</p>
              <span className="inline-flex items-center justify-center w-full py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--organic-terracotta)" }}>
                {copy.navbar.premium.cta}
              </span>
            </Link>
          )}
          <Link href="/profilo" className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", pathname.startsWith("/profilo") ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}>
            <User className="w-5 h-5 shrink-0" />
            {session?.user?.name ?? "Profilo"}
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3 text-muted-foreground mt-1" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="w-5 h-5" />
            Esci
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">{APP_NAME}</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-background/95 pt-14">
          <nav className="p-4 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className={cn("flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors", active ? "bg-primary/15 text-primary" : "text-muted-foreground")}>
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
