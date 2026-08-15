import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminSiteContentPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminSiteContent.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminSiteContent.subtitle}</p>
      </div>
      <SiteContentEditor />
    </div>
  );
}
