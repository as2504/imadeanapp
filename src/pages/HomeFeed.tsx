import { useState, useEffect, useRef, useCallback } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import FeedFilters from "@/components/feed/FeedFilters";
import type { FeedFilterState } from "@/components/feed/FeedFilters";
import FeedSidebar from "@/components/feed/FeedSidebar";
import FeedLayout from "@/components/layout/FeedLayout";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HomeFeed = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [filters, setFilters] = useState<FeedFilterState>({ feed: "for-you", sort: "", platform: "all", techStack: "", category: "" });
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const fetchApps = useCallback(async () => {
    setLoading(true);
    let followedIds: string[] = [];
    if (filters.feed === "following" && user) {
      const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      followedIds = (follows || []).map((f) => f.following_id);
      if (followedIds.length === 0) { setPosts([]); setLoading(false); return; }
    }

    let query = supabase.from("apps").select("*").eq("status", "published");
    if (filters.feed === "following" && followedIds.length > 0) query = query.in("user_id", followedIds);
    if (filters.platform && filters.platform !== "all") query = query.contains("platforms", [filters.platform]);
    if (filters.techStack) query = query.contains("tech_stack", [filters.techStack]);
    if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);

    if (filters.sort === "liked" || filters.sort === "rated") query = query.order("likes_count", { ascending: false });
    else if (filters.sort === "viewed") query = query.order("views_count", { ascending: false });
    else if (filters.sort === "recent") query = query.order("created_at", { ascending: false });
    else if (filters.feed === "trending") query = query.order("views_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data: apps } = await query.limit(50);
    if (!apps || apps.length === 0) { setPosts([]); setLoading(false); return; }

    const userIds = [...new Set(apps.map((a) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    setPosts(apps.map((app) => {
      const profile = profileMap.get(app.user_id);
      return {
        id: app.id, slug: (app as any).slug || undefined, appName: app.app_name,
        appIcon: app.app_icon_url || "📱", publisherName: profile?.display_name || profile?.username || "Unknown",
        publisherAvatar: (profile?.display_name || "U").charAt(0), verified: false,
        timeAgo: getTimeAgo(app.created_at), caption: app.caption || app.tagline || "",
        tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
        techStack: app.tech_stack || [], likes: app.likes_count || 0, comments: app.comments_count || 0,
        views: app.views_count || 0, liked: false, saved: false,
      };
    }));
    setLoading(false);
  }, [filters, user]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("animate-reveal"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, posts]);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="pt-16 pb-20 md:pb-8">
        <FeedLayout sidebar={<FeedSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="bg-card border border-border/40 rounded-2xl shadow-sm overflow-hidden min-h-[600px] flex flex-col relative">
              <div className="sticky top-14 z-30 bg-card border-b border-border/40 py-1.5 px-4 sm:px-6">
                <FeedFilters onOpenSidebar={onOpenSidebar} onFilterChange={setFilters} />
              </div>
              <div className="flex-1 p-1 sm:p-2">
                {loading ? <FeedSkeleton /> : (
                  <div>
                    {posts.map((post, i) => (
                      <div key={post.id} ref={(el) => { if (el) cardRefs.current.set(post.id, el); }} className="opacity-0" style={{ animationDelay: `${i * 60}ms` }}>
                        <AppCard post={post} />
                      </div>
                    ))}
                  </div>
                )}
                {!loading && posts.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground italic text-sm">No apps found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </FeedLayout>
      </main>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export default HomeFeed;
