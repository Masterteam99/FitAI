import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { ComeFunzionaContent } from "./ComeFunzionaContent";

export const metadata: Metadata = {
  title: copy.comeFunziona.meta.title,
  description: copy.comeFunziona.meta.description,
};

export default function ComeFunzionaPage() {
  return <ComeFunzionaContent />;
}
