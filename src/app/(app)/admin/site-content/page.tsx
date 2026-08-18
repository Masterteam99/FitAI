import { SiteContentEditor } from "@/components/admin/SiteContentEditor";
import { SiteVisualEditor } from "@/components/admin/SiteVisualEditor";
import { copy } from "@/content/copy";

export const dynamic = "force-dynamic";

export default function AdminSiteContentPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminSiteContent.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminSiteContent.subtitle}</p>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">{copy.adminSiteContent.visualEditorTitle}</h2>
          <p className="text-sm text-muted-foreground">{copy.adminSiteContent.visualEditorSubtitle}</p>
        </div>
        <SiteVisualEditor />
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div>
          <h2 className="text-lg font-semibold">{copy.adminSiteContent.listEditorTitle}</h2>
          <p className="text-sm text-muted-foreground">{copy.adminSiteContent.listEditorSubtitle}</p>
        </div>
        <SiteContentEditor />
      </div>
    </div>
  );
}
