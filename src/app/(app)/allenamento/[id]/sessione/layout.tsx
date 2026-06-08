export default function SessionImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 bg-background overflow-y-auto">
      {children}
    </div>
  );
}
