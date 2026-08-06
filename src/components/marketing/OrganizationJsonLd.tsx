import { copy } from "@/content/copy";
import { SITE_URL } from "@/lib/site-url";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Motion Insight",
  url: SITE_URL,
  description: copy.layout.meta.description,
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
    />
  );
}
