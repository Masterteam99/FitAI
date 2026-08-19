"use client";

import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

export function EserciziHeading({ count }: { count: number }) {
  const copy = useCopy();
  return (
    <div>
      <h1 className="text-2xl font-bold"><EditableText path="esercizi.title">{copy.esercizi.title}</EditableText></h1>
      <p className="text-muted-foreground">{copy.esercizi.countAvailable(count)}</p>
    </div>
  );
}

export function EserciziNoResults() {
  const copy = useCopy();
  return <p className="text-muted-foreground"><EditableText path="esercizi.noResults">{copy.esercizi.noResults}</EditableText></p>;
}
