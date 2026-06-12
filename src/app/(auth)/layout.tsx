export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-organic relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="organic-grain" />
      <div className="organic-blob w-[480px] h-[480px] -top-40 -right-40 opacity-40" style={{ background: "var(--organic-terracotta-soft)" }} />
      <div className="organic-blob w-[420px] h-[420px] -bottom-44 -left-44 opacity-30" style={{ background: "var(--organic-sage)" }} />
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
