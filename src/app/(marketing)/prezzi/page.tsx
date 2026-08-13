import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { PrezziContent } from "./PrezziContent";

export const metadata: Metadata = {
  title: copy.prezzi.meta.title,
  description: copy.prezzi.meta.description,
};

export default function PrezziPage() {
  return <PrezziContent />;
}
