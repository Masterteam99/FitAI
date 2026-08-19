import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SiteEditModeProvider } from "@/content/SiteEditMode";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) return <SiteEditModeProvider>{children}</SiteEditModeProvider>;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { onboardingCompleted: true },
  });
  if (user?.onboardingCompleted) redirect("/dashboard");

  return <SiteEditModeProvider>{children}</SiteEditModeProvider>;
}
