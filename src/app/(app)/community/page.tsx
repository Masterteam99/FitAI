"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Dumbbell, Trophy, Image as ImageIcon, Loader2, Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { copy } from "@/content/copy";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

interface FeedPost {
  id: string;
  type: "WORKOUT_SHARE" | "ACHIEVEMENT" | "PROGRESS_PHOTO" | "CHALLENGE_COMPLETION";
  content: string;
  imageUrl: string | null;
  likesCount: number;
  createdAt: string;
  user: { id: string; name: string | null; avatar: string | null };
  likedByMe: boolean;
  commentsCount: number;
}

interface Comment { id: string; content: string; createdAt: string; userName: string | null }

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

// Community è funzionante (post/like/commenti) ma per decisione prodotto resta
// nascosta dietro un placeholder "in arrivo" finché non si decide come usarla
// (vedi Aggiornameni possibili.md, punto 6). Il codice sotto resta intatto.
const COMMUNITY_COMING_SOON = true;

function CommunityComingSoon() {
  const c = useCopy().community;
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-3">
      <Users className="w-10 h-10 text-muted-foreground mx-auto" />
      <h1 className="text-xl font-bold"><EditableText path="community.comingSoonTitle">{c.comingSoonTitle}</EditableText></h1>
      <p className="text-sm text-muted-foreground"><EditableText path="community.comingSoonSubtitle">{c.comingSoonSubtitle}</EditableText></p>
    </div>
  );
}

export default function CommunityPage() {
  if (COMMUNITY_COMING_SOON) return <CommunityComingSoon />;

  return <CommunityFeed />;
}

function CommunityFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

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

  async function publish() {
    if (!draft.trim() || posting) return;
    setPosting(true);
    const res = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft.trim() }),
    });
    setPosting(false);
    if (res.ok) {
      const post: FeedPost = await res.json();
      setPosts((p) => [post, ...p]);
      setDraft("");
    }
  }

  async function toggleLike(id: string) {
    setPosts((p) => p.map((post) => post.id === id
      ? { ...post, likedByMe: !post.likedByMe, likesCount: post.likesCount + (post.likedByMe ? -1 : 1) }
      : post));
    await fetch(`/api/community/posts/${id}/like`, { method: "POST" });
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          {copy.community.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{copy.community.subtitle}</p>
      </div>

      {/* Composer */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={copy.community.composerPlaceholder}
            maxLength={1000}
            className="w-full bg-secondary/40 border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
          />
          <div className="flex justify-end">
            <Button onClick={publish} disabled={posting || !draft.trim()} className="gap-2">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {copy.community.post}
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} />
            ))}
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

function PostCard({ post, onLike }: { post: FeedPost; onLike: () => void }) {
  const Icon = TYPE_ICON[post.type] ?? Dumbbell;
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [count, setCount] = useState(post.commentsCount);

  async function openComments() {
    setOpen((v) => !v);
    if (comments === null) {
      const res = await fetch(`/api/community/posts/${post.id}/comments`);
      const d: { items: Comment[] } = await res.json();
      setComments(d.items ?? []);
    }
  }

  async function addComment() {
    if (!text.trim() || sending) return;
    setSending(true);
    const res = await fetch(`/api/community/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    setSending(false);
    if (res.ok) {
      const c: Comment = await res.json();
      setComments((prev) => [...(prev ?? []), c]);
      setCount((n) => n + 1);
      setText("");
    }
  }

  return (
    <Card>
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

        <p className="text-sm whitespace-pre-wrap">{post.content}</p>

        <div className="flex items-center gap-4 pt-1">
          <button onClick={onLike} className={`flex items-center gap-1.5 text-sm transition-colors ${post.likedByMe ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}>
            <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-current" : ""}`} />
            {post.likesCount}
          </button>
          <button onClick={openComments} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <MessageCircle className="w-4 h-4" />
            {count}
          </button>
        </div>

        {open && (
          <div className="space-y-3 pt-2 border-t border-border">
            {comments === null ? (
              <div className="flex justify-center py-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">{copy.community.noComments}</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium">{c.userName ?? copy.community.anonymous}</span>{" "}
                  <span className="text-muted-foreground">{c.content}</span>
                </div>
              ))
            )}
            <div className="flex items-center gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={copy.community.commentPlaceholder}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addComment(); } }} />
              <Button size="sm" onClick={addComment} disabled={sending || !text.trim()} className="shrink-0">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : copy.community.addComment}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
