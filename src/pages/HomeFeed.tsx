import { useState, useEffect, useRef, useCallback } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import UsernamePrompt from "@/components/UsernamePrompt";
import FeedFilters from "@/components/feed/FeedFilters";
import type { FeedFilterState } from "@/components/feed/FeedFilters";
import FeedSidebar from "@/components/feed/FeedSidebar";
import FeedLayout from "@/components/layout/FeedLayout";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import EmailVerificationBanner from "@/components/feed/EmailVerificationBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 20;

const HomeFeed = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<AppPost[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<FeedFilterState>({ feed: "for-you", sort: "", platform: "all", techStack: "", category: "" });
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [showFilters, setShowFilters] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 100) { setShowFilters(true); }
      else if (y < lastScrollY.current) { setShowFilters(true); }
      else { setShowFilters(false); }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const mapApps = (apps: any[], profileMap: Map<string, any>): AppPost[] => {
    return apps.map((app) => {
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
    });
  };

  const fetchApps = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    const useTrending = filters.feed === "for-you" && !filters.sort;

    if (useTrending) {
      const { data: trendingData } = await (supabase as any).rpc("get_trending_apps", {
        time_filter: "all",
        max_results: 200,
      });

      if (!trendingData || trendingData.length === 0) {
        await fetchRegular(pageNum, append);
        return;
      }

      const appIds = trendingData.map((t: any) => t.app_id);
      const trendingMap = new Map(trendingData.map((t: any) => [t.app_id, t]));

      let query = supabase.from("apps").select("*").in("id", appIds).eq("status", "published");
      if (filters.platform && filters.platform !== "all") query = query.contains("platforms", [filters.platform]);
      if (filters.techStack) query = query.contains("tech_stack", [filters.techStack]);
      if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);

      const { data: apps } = await query;
      if (!apps || apps.length === 0) { setPosts([]); setLoading(false); setLoadingMore(false); setHasMore(false); return; }

      const sortedApps = apps.sort((a, b) => {
        const scoreA = (trendingMap.get(a.id) as any)?.trending_score || 0;
        const scoreB = (trendingMap.get(b.id) as any)?.trending_score || 0;
        return scoreB - scoreA;
      });

      // Paginate locally
      const sliced = sortedApps.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE);
      const userIds = [...new Set(sliced.map((a) => a.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const mapped = mapApps(sliced, profileMap);
      setPosts(prev => append ? [...prev, ...mapped] : mapped);
      setHasMore(sliced.length === PAGE_SIZE && (pageNum + 1) * PAGE_SIZE < sortedApps.length);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    await fetchRegular(pageNum, append);
  }, [filters, user]);

  const fetchRegular = useCallback(async (pageNum = 0, append = false) => {
    let followedIds: string[] = [];
    if (filters.feed === "following" && user) {
      const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      followedIds = (follows || []).map((f) => f.following_id);
      if (followedIds.length === 0) { setPosts([]); setLoading(false); setLoadingMore(false); setHasMore(false); return; }
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

    const from = pageNum * PAGE_SIZE;
    const { data: apps } = await query.range(from, from + PAGE_SIZE - 1);
    if (!apps || apps.length === 0) {
      if (!append) setPosts([]);
      setHasMore(false);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const userIds = [...new Set(apps.map((a) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const mapped = mapApps(apps, profileMap);
    setPosts(prev => append ? [...prev, ...mapped] : mapped);
    setHasMore(apps.length === PAGE_SIZE);
    setLoading(false);
    setLoadingMore(false);
  }, [filters, user]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchApps(0, false);
  }, [fetchApps]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchApps(nextPage, true);
  };

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
      <EmailVerificationBanner />
      <UsernamePrompt />
      <main className="pt-16 pb-20 md:pb-8">
        <FeedLayout sidebar={<FeedSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="min-h-[600px] flex flex-col relative">
              <div className={`sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40 py-1 px-4 sm:px-6 transition-transform duration-300 ${showFilters ? "translate-y-0" : "-translate-y-full"}`}>
                <FeedFilters onOpenSidebar={onOpenSidebar} onFilterChange={setFilters} />
              </div>
              <div className="flex-1 pt-2">
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
                {!loading && hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-8">
                    <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleLoadMore} disabled={loadingMore}>
                      {loadingMore ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : "Load More"}
                    </Button>
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

export default HomeFeed;
