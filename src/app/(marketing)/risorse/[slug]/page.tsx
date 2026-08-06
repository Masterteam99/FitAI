import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { ARTICLES, getArticle } from "@/content/articles";
import { copy } from "@/content/copy";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Articolo" };
  return { title: a.title, description: a.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();

  const dateLabel = new Date(a.date).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  return (
    <article className="max-w-2xl mx-auto px-4 py-16">
      <Link
        href="/risorse"
        className="inline-flex items-center gap-1.5 text-sm font-semibold mb-8"
        style={{ color: "var(--organic-green-deep)" }}
      >
        <ArrowLeft className="w-4 h-4" /> {copy.risorse.backToList}
      </Link>

      <SlideUp>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="font-semibold uppercase tracking-wide" style={{ color: "var(--organic-green-deep)" }}>{a.category}</span>
          <span>·</span>
          <span>{a.readingMin} {copy.risorse.readingSuffix}</span>
          <span>·</span>
          <time dateTime={a.date}>{dateLabel}</time>
        </div>
        <h1 className="text-display-md mb-6">{a.title}</h1>
      </SlideUp>

      <FadeIn delay={0.1}>
        <div className="text-[1.02rem]">
          {a.body.map((b, i) => {
            if (b.type === "h2") {
              return <h2 key={i} className="font-display text-2xl mt-9 mb-3">{b.text}</h2>;
            }
            if (b.type === "ul") {
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5 text-muted-foreground my-4">
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              );
            }
            return <p key={i} className="text-muted-foreground leading-relaxed my-4">{b.text}</p>;
          })}
        </div>
      </FadeIn>

      <div className="mt-12 pt-8 border-t border-border text-center space-y-4">
        <p className="font-display text-xl">{copy.risorse.ctaTitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">
            {copy.risorse.ctaButton} <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
