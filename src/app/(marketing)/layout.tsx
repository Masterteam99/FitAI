import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <GradientMesh palette="rainbow" intensity="medium" fixed />
      <MarketingHeader />
      <main className="relative">{children}</main>
      <MarketingFooter />
    </div>
  );
}
