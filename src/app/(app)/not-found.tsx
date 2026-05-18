import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold">Sezione non trovata</h1>
        <p className="max-w-md text-muted-foreground">
          Questa pagina non esiste. Controlla l&apos;URL o torna alle sezioni principali dell&apos;app.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/allenamento">
            <ArrowLeft className="h-4 w-4" />
            Allenamenti
          </Link>
        </Button>
      </div>
    </div>
  );
}
