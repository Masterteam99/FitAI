import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { ChiSiamoContent } from "./ChiSiamoContent";

export const metadata: Metadata = {
  title: copy.chiSiamo.meta.title,
  description: copy.chiSiamo.meta.description,
};

export default function ChiSiamoPage() {
  return <ChiSiamoContent />;
}
