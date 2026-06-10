import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/allenamento",
        "/analisi",
        "/progressi",
        "/profilo",
        "/onboarding",
        "/nutrizione",
        "/ai-coach",
        "/abbonamento",
        "/community",
        "/esercizi",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
