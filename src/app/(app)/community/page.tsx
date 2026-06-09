"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Dumbbell, Trophy, Image as ImageIcon, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { copy } from "@/content/copy";

interface FeedPost {
  id: string;
  type: "WORKOUT_SHARE" | "ACHIEVEMENT" | "PROGRESS_PHOTO" | "CHALLENGE_COMPLETION";
  content: string;
  imageUrl: string | null;
  likesCount: number;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
}

const TYPE_ICON = {
  WORKOUT_SHARE: Dumbbell,
  ACHIEVEMENT: Trophy,
  PROGRESS_PHOTO: ImageIcon,
  CHALLENGE_COMPLETION: Trophy,
} as const;

const TYPE_LABEL = copy.community.typeLabels;

function initials(name: string | null): string {
  if (!name) return copy.community.unknownInitials;
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetch("/api/community/feed")
      .then((r) => r.json())
      .then((d: { items: FeedPost[]; nextCursor: string | null }) => {
        setPosts(d.items ?? []);
        setCursor(d.nextCursor);
        setHasMore(!!d.nextCursor);
      })
      .finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const res = await fetch(`/api/community/feed?cursor=${cursor}`);
    const d: { items: FeedPost[]; nextCursor: string | null } = await res.json();
    setPosts((p) => [...p, ...(d.items ?? [])]);
    setCursor(d.nextCursor);
    setHasMore(!!d.nextCursor);
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          {copy.community.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {copy.community.subtitle}
        </p>
      </div>

      {posts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center space-y-2">
            <Users className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="font-medium">{copy.community.emptyTitle}</p>
            <p className="text-sm text-muted-foreground">{copy.community.emptySubtitle}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => {
              const Icon = TYPE_ICON[post.type] ?? Dumbbell;
              return (
                <Card key={post.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials(post.user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{post.user.name ?? copy.community.anonymous}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: it })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                        <Icon className="w-3 h-3" />
                        {TYPE_LABEL[post.type] ?? post.type}
                      </Badge>
                    </div>
                    <p className="text-sm">{post.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : copy.community.loadMore}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
