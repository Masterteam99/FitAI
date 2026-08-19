import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { ScaricaContent } from "./ScaricaContent";

export const metadata: Metadata = {
  title: copy.scarica.meta.title,
  description: copy.scarica.meta.description,
};

export default function ScaricaPage() {
  return <ScaricaContent />;
}
