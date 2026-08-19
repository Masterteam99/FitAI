import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { ProvaGratuitaPageContent } from "./ProvaGratuitaPageContent";

export const metadata: Metadata = {
  title: copy.provaGratuita.meta.title,
  description: copy.provaGratuita.meta.description,
};

export default function ProvaGratuitaPage() {
  return <ProvaGratuitaPageContent />;
}
