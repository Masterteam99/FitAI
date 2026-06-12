import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.privacy.meta.title };

type Block =
  | { type: "p"; text: string; className?: string; emailMono?: string }
  | { type: "ul"; items: ReadonlyArray<{ strong?: string; text: string }> };

function renderBlock(block: Block, i: number) {
  if (block.type === "ul") {
    return (
      <ul key={i} className="list-disc pl-6 space-y-1">
        {block.items.map((it, j) => (
          <li key={j}>
            {it.strong ? (
              <>
                <strong>{it.strong}</strong>
                {it.text}
              </>
            ) : (
              it.text
            )}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p key={i} className={block.className}>
      {block.text}
      {block.emailMono ? <span className="font-mono text-sm">{block.emailMono}</span> : null}
    </p>
  );
}

export default function PrivacyPage() {
  return (
    <div className="theme-organic min-h-screen bg-background text-foreground p-4 py-10">
      <article className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {copy.privacy.backHome}
        </Link>

        <header>
          <h1 className="text-3xl font-bold">{copy.privacy.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{copy.privacy.lastUpdated}</p>
        </header>

        {copy.privacy.sections.map((section, i) => (
          <Section key={i} title={section.title}>
            {section.blocks.map((block, j) => renderBlock(block as Block, j))}
          </Section>
        ))}
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}
