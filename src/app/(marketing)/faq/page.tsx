import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { FaqContent } from "./FaqContent";

export const metadata: Metadata = {
  title: copy.faq.meta.title,
  description: copy.faq.meta.description,
};

const FAQS = copy.faq.faqs;

// Schema FAQPage generato dalle stesse Q&A visibili: non possono divergere
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FaqContent />
    </>
  );
}
