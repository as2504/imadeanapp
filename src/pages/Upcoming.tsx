import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getTimeAgo } from "@/lib/utils";
import FeedNavbar from "@/components/feed/FeedNavbar";
import PublicNavbar from "@/components/layout/PublicNavbar";
import SEO from "@/components/SEO";
import IdeaCard, { type UpcomingApp } from "@/components/upcoming/IdeaCard";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, Plus } from "lucide-react";

const PAGE_SIZE = 20;
type Sort = "top" | "recent" | "discussed" | "soon";

const SORTS: { id: Sort; label: string }[] = [
  { id: "top", label: "Top Voted" },
  { id: "recent", label: "Most Recent" },
  { id: "discussed", label: "Most Discussed" },
  { id: "soon", label: "Launching Soon" },
];

const Upcoming = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sort, setSort] = useState<Sort>("top");

  const fetchPage = async ({ pageParam = 0 }: { pageParam?: number }): Promise<{ ideas: UpcomingApp[]; nextPage: number | null }> => {
    let q = supabase
      .from("apps")
      .select("id, slug, app_name, app_icon_url, caption, tagline, tags, platforms, upvotes_count, notify_count, comments_count, planned_launch, user_id, created_at")
      .eq("status", "upcoming");

    if (sort === "top") q = q.order("upvotes_count", { ascending: false }).order("created_at", { ascending: false });
    else if (sort === "recent") q = q.order("created_at", { ascending: false });
    else if (sort === "discussed") q = q.order("comments_count", { ascending: false }).order("created_at", { ascending: false });
    else if (sort === "soon") q = q.order("planned_launch", { ascending: true, nullsFirst: false }).order("upvotes_count", { ascending: false });

    const from = pageParam * PAGE_SIZE;
    const { data: apps } = await q.range(from, from + PAGE_SIZE - 1);
    if (!apps || apps.length === 0) return { ideas: [], nextPage: null };

    const userIds = [...new Set(apps.map((a) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const pmap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const ideas: UpcomingApp[] = apps.map((a: any) => {
      const p = pmap.get(a.user_id);
      return {
        id: a.id, slug: a.slug || undefined,
        appName: a.app_name, appIcon: a.app_icon_url || "💡",
        caption: a.caption || a.tagline || "",
        tags: a.tags || [], platforms: a.platforms || [],
        upvotesCount: a.upvotes_count || 0, notifyCount: a.notify_count || 0,
        commentsCount: a.comments_count || 0, plannedLaunch: a.planned_launch,
        publisherName: p?.display_name || p?.username || "Unknown",
        publisherUserId: a.user_id, timeAgo: getTimeAgo(a.created_at),
      };
    });
    return { ideas, nextPage: apps.length === PAGE_SIZE ? pageParam + 1 : null };
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["upcoming-feed", sort],
    queryFn: fetchPage,
    getNextPageParam: (last) => last.nextPage,
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
  });

  const ideas = data?.pages.flatMap((p) => p.ideas) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Upcoming Apps — imadeanapp"
        description="Discover and validate upcoming app ideas from indie builders. Upvote, comment, and get notified when they launch."
        canonical={typeof window !== "undefined" ? window.location.href : undefined}
      />
      {user ? <FeedNavbar /> : <PublicNavbar />}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={20} className="text-amber-500" />
              <h1 className="text-2xl font-black tracking-tight text-foreground">Upcoming Apps</h1>
            </div>
            <p className="text-sm text-muted-foreground">Validate ideas before they ship. Upvote, discuss, get notified.</p>
          </div>
          <Button onClick={() => user ? navigate("/post-idea") : navigate("/auth")} className="rounded-xl gap-2 shrink-0 hidden sm:inline-flex">
            <Plus size={16} /> Post idea
          </Button>
        </div>

        <div className="flex items-center gap-1 border-b border-border/40 mb-2 overflow-x-auto">
          {SORTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`relative px-4 py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${sort === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s.label}
              {sort === s.id && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-20 px-6">
              <Lightbulb size={32} className="mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No ideas yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Be the first to post an idea and gather early supporters.</p>
              <Button onClick={() => user ? navigate("/post-idea") : navigate("/auth")} className="rounded-xl">Post an idea</Button>
            </div>
          ) : (
            ideas.map((i) => <IdeaCard key={i.id} idea={i} />)
          )}
        </div>

        {!isLoading && hasNextPage && ideas.length > 0 && (
          <div className="flex justify-center py-8">
            <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : "Load More"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upcoming;
