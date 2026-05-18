import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Compass className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-2">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-bold">Pagina non trovata</h1>
        <p className="max-w-md text-muted-foreground">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Vai alla dashboard
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Torna alla home</Link>
        </Button>
      </div>
    </div>
  );
}
