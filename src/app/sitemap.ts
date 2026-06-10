import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingPages = [
    { path: "", priority: 1 },
    { path: "/funzionalita", priority: 0.8 },
    { path: "/come-funziona", priority: 0.8 },
    { path: "/prezzi", priority: 0.9 },
    { path: "/chi-siamo", priority: 0.5 },
    { path: "/faq", priority: 0.7 },
  ];

  return marketingPages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority,
  }));
}
