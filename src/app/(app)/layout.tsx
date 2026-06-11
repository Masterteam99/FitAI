import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { onboardingCompleted: true, isAdmin: true },
  });
  if (!user?.onboardingCompleted) redirect("/onboarding");

  return (
    // Tema "mix" Track A: skin organica (token rimappati) sull'app loggata,
    // con gli accenti energy esistenti come componente atletica.
    <div className="theme-organic flex min-h-screen bg-background text-foreground">
      <div className="organic-grain" />
      <Navbar isAdmin={user.isAdmin} />
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 relative z-[2]">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
