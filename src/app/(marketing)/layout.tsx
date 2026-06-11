import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { OrganizationJsonLd } from "@/components/marketing/OrganizationJsonLd";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-organic relative min-h-screen overflow-hidden bg-background text-foreground">
      <OrganizationJsonLd />
      <div className="organic-grain" />
      <div className="organic-blob w-[480px] h-[480px] -top-40 -right-40 opacity-40" style={{ background: "var(--organic-terracotta-soft)" }} />
      <div className="organic-blob w-[420px] h-[420px] top-[60vh] -left-44 opacity-30" style={{ background: "var(--organic-sage)" }} />
      <MarketingHeader />
      <main className="relative z-[2]">{children}</main>
      <MarketingFooter />
    </div>
  );
}
