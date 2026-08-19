import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { RisorseContent } from "./RisorseContent";

export const metadata: Metadata = {
  title: copy.risorse.meta.title,
  description: copy.risorse.meta.description,
};

export default function RisorsePage() {
  return <RisorseContent />;
}
