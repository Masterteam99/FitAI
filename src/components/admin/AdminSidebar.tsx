"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, Dumbbell, BarChart3, ShieldCheck, Bot, History, MessageSquare, Apple, ListChecks, Type, ClipboardList, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";

const ADMIN_TABS = [
  { href: "/admin/users", label: copy.adminSidebar.tabUsers, icon: Users },
  { href: "/admin/subscriptions", label: copy.adminSidebar.tabSubscriptions, icon: CreditCard },
  { href: "/admin/exercises", label: copy.adminSidebar.tabExercises, icon: Dumbbell },
  { href: "/admin/stats", label: copy.adminSidebar.tabStats, icon: BarChart3 },
  { href: "/admin/admins", label: copy.adminSidebar.tabAdmins, icon: ShieldCheck },
  { href: "/admin/ai-usage", label: copy.adminSidebar.tabAiUsage, icon: Bot },
  { href: "/admin/revisions", label: copy.adminSidebar.tabRevisions, icon: MessageSquare },
  { href: "/admin/nutrition-plans", label: copy.adminSidebar.tabNutritionPool, icon: Apple },
  { href: "/admin/workout-plans", label: copy.adminSidebar.tabWorkoutPool, icon: ClipboardList },
  { href: "/admin/recipes", label: copy.adminSidebar.tabRecipes, icon: UtensilsCrossed },
  { href: "/admin/quiz", label: copy.adminSidebar.tabQuiz, icon: ListChecks },
  { href: "/admin/site-content", label: copy.adminSidebar.tabSiteContent, icon: Type },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden lg:flex flex-col w-[180px] bg-card border-r border-border p-3 gap-1 shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2">{copy.adminSidebar.sectionLabel}</div>
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
          {copy.adminSidebar.activity}
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
