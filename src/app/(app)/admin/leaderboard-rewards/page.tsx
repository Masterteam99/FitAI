import type { Metadata } from "next";
import { AdminLeaderboardRewardsManager } from "@/components/admin/AdminLeaderboardRewardsManager";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminLeaderboardRewards.meta.title };
export const dynamic = "force-dynamic";

export default function AdminLeaderboardRewardsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminLeaderboardRewards.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{copy.adminLeaderboardRewards.subtitle}</p>
      </div>
      <AdminLeaderboardRewardsManager />
    </div>
  );
}
