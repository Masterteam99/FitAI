import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { PerChiContent } from "./PerChiContent";

export const metadata: Metadata = {
  title: copy.perChi.meta.title,
  description: copy.perChi.meta.description,
};

export default function PerChiPage() {
  return <PerChiContent />;
}
