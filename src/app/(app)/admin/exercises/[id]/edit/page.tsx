import Link from "next/link";
import { AdminEditExercise } from "@/components/admin/AdminEditExercise";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default async function AdminEditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/admin/exercises" className="text-xs text-muted-foreground hover:text-foreground">
        {copy.adminNewExercise.back}
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{copy.adminNewExercise.editExercise}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminNewExercise.subtitle}</p>
      </div>
      <AdminEditExercise id={id} />
    </div>
  );
}
