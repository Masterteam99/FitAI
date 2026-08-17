"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, PlayCircle, Apple, Library, TrendingUp, Users, User, LogOut, Sparkles, ShieldCheck, Menu, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { APP_NAME, copy } from "@/content/copy";

const ICONS: Record<string, typeof Home> = {
  "/dashboard": Home,
  "/allenamento": PlayCircle,
  "/nutrizione": Apple,
  "/esercizi": Library,
  "/progressi": TrendingUp,
  "/community": Users,
  "/leaderboard": Trophy,
  "/profilo": User,
};

const NAV_ITEMS = copy.navbar.items.map((i) => ({ ...i, icon: ICONS[i.href] ?? Home }));
const MENU_ITEMS = copy.navbar.menu.map((i) => ({ ...i, icon: ICONS[i.href] ?? User }));

export function Navbar({ isAdmin, isPremium = false }: { isAdmin: boolean; isPremium?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
      active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
    );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-card border-r border-border fixed left-0 top-0 z-30">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
            <span className="w-9 h-9 rounded-[10px] grid place-items-center" style={{ background: "var(--primary)" }}>
              <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none" aria-hidden><path d="M8 23c3.2-10 6-10 7-4.5s3.8 5.5 7-6c1.5-5.4 4-5 6-1" stroke="var(--organic-green-soft)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span>{APP_NAME}</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
                <Icon className="w-5 h-5 shrink-0" />
                {item.longLabel}
              </Link>
            );
          })}

          <div className="my-2 border-t border-border" />

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={linkClass(isActive(item.href))}>
                <Icon className="w-5 h-5 shrink-0" />
                {item.longLabel}
              </Link>
            );
          })}

          {isAdmin && (
            <Link href={copy.navbar.admin.href} className={linkClass(isActive("/admin"))}>
              <ShieldCheck className="w-5 h-5 shrink-0" />
              {copy.navbar.admin.label}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          {!isPremium && (
            <Link href="/abbonamento" className="block rounded-xl p-4 mb-3 text-white transition-transform hover:-translate-y-0.5" style={{ background: "var(--organic-espresso)" }}>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide mb-1" style={{ color: "var(--organic-terracotta-soft)" }}>
                <Sparkles className="w-3.5 h-3.5" /> {copy.navbar.premium.title}
              </div>
              <p className="text-xs mb-3" style={{ color: "rgba(234,241,248,.78)" }}>{copy.navbar.premium.desc}</p>
              <span className="inline-flex items-center justify-center w-full py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--organic-terracotta)" }}>
                {copy.navbar.premium.cta}
              </span>
            </Link>
          )}
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--secondary)", color: "var(--primary)" }}>
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
            <span className="text-sm truncate flex-1">{session?.user?.name ?? copy.navbar.profileFallback}</span>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => signOut({ callbackUrl: "/" })} aria-label={copy.navbar.logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top header (logo + menu ☰) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: "var(--primary)" }}>
            <svg viewBox="0 0 36 36" className="w-5 h-5" fill="none" aria-hidden><path d="M8 23c3.2-10 6-10 7-4.5s3.8 5.5 7-6c1.5-5.4 4-5 6-1" stroke="var(--organic-green-soft)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          {APP_NAME}
        </Link>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={copy.navbar.menuLabel}
          aria-expanded={menuOpen}
          className="text-muted-foreground p-2 -mr-2"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile menu dropdown (Community, Profilo, Admin, Esci) */}
      {menuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 top-14 z-30 bg-black/30" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="lg:hidden fixed top-14 right-0 z-40 w-60 bg-card border-l border-b border-border rounded-bl-2xl shadow-xl p-3 space-y-1">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={linkClass(isActive(item.href))}>
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link href={copy.navbar.admin.href} onClick={() => setMenuOpen(false)} className={linkClass(isActive("/admin"))}>
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {copy.navbar.admin.label}
              </Link>
            )}
            <div className="my-1 border-t border-border" />
            <button
              onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {copy.navbar.logout}
            </button>
          </div>
        </>
      )}

      {/* Mobile bottom tab bar (5 tab principali) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold transition-colors", active ? "text-primary" : "text-muted-foreground")}
            >
              <Icon className={cn("w-5 h-5", active && "scale-110 transition-transform")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
