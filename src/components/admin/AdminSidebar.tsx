"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, Dumbbell, BarChart3, ShieldCheck, Bot, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_TABS = [
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/subscriptions", label: "Abbonamenti", icon: CreditCard },
  { href: "/admin/exercises", label: "Esercizi & PT", icon: Dumbbell },
  { href: "/admin/stats", label: "Statistiche", icon: BarChart3 },
  { href: "/admin/admins", label: "Gestione admin", icon: ShieldCheck },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Bot },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden lg:flex flex-col w-[180px] bg-card border-r border-border p-3 gap-1 shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2">Sezione admin</div>
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
        <Link
          href="/admin/activity"
          className={cn(
            "mt-auto flex items-center gap-2 px-3 py-2 rounded-md text-xs border-t border-border pt-3",
            pathname.startsWith("/admin/activity") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="w-3.5 h-3.5" />
          Attività recente →
        </Link>
      </aside>

      <div className="lg:hidden flex overflow-x-auto gap-1 px-2 py-2 border-b border-border bg-card sticky top-14 z-10">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
