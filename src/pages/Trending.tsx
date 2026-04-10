import { useState, useEffect, useRef, useCallback } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import TrendingFilters from "@/components/trending/TrendingFilters";
import type { TrendingFilterState } from "@/components/trending/TrendingFilters";
import TrendingSidebar from "@/components/trending/TrendingSidebar";
import TrendingCard from "@/components/trending/TrendingCard";
import type { TrendingApp } from "@/components/trending/TrendingCard";
import FeedLayout from "@/components/layout/FeedLayout";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { getTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 20;

const timeFilterMap: Record<string, string> = {
  "Today": "today",
  "This Week": "week",
  "This Month": "month",
  "All Time": "all",
};

const Trending = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apps, setApps] = useState<(TrendingApp & { slug?: string })[]>([]);
  const [allTrendingApps, setAllTrendingApps] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<TrendingFilterState>(() => {
    try {
      const saved = sessionStorage.getItem("trending-filters");
      return saved ? JSON.parse(saved) : { time: "This Week", category: "" };
    } catch { return { time: "This Week", category: "" }; }
  });
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

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setPage(0);
    const tf = timeFilterMap[filters.time] || "week";

    const { data: trendingData, error } = await (supabase as any).rpc("get_trending_apps", {
      time_filter: tf,
      max_results: 200,
    });

    if (error || !trendingData || trendingData.length === 0) {
      setApps([]);
      setAllTrendingApps([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    const appIds = trendingData.map((t: any) => t.app_id);
    const trendingMap = new Map(trendingData.map((t: any) => [t.app_id, t]));

    let query = supabase.from("apps").select("*").in("id", appIds).eq("status", "published");
    if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);
    const { data: rawApps } = await query;

    if (!rawApps || rawApps.length === 0) { setApps([]); setAllTrendingApps([]); setHasMore(false); setLoading(false); return; }

    const sortedApps = rawApps.sort((a, b) => {
      const scoreA = (trendingMap.get(a.id) as any)?.trending_score || 0;
      const scoreB = (trendingMap.get(b.id) as any)?.trending_score || 0;
      return scoreB - scoreA;
    });

    setAllTrendingApps(sortedApps.map((app, i) => ({ ...app, trendingScore: (trendingMap.get(app.id) as any)?.trending_score || 0, rank: i + 1 })));

    // First page
    const firstPage = sortedApps.slice(0, PAGE_SIZE);
    const userIds = [...new Set(firstPage.map((a) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    setApps(firstPage.map((app, i) => {
      const profile = profileMap.get(app.user_id);
      const stats = trendingMap.get(app.id) as any;
      return {
        id: app.id, slug: (app as any).slug || undefined, rank: i + 1,
        appName: app.app_name, appIcon: app.app_icon_url || "📱",
        publisherName: profile?.display_name || profile?.username || "Unknown",
        publisherAvatar: (profile?.display_name || "U").charAt(0), verified: false,
        timeAgo: getTimeAgo(app.created_at), caption: app.caption || app.tagline || "",
        tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
        techStack: app.tech_stack || [], likes: app.likes_count || 0, comments: app.comments_count || 0,
        views: app.views_count || 0, liked: false, saved: false,
        trendLabel: "", growthPercent: 0,
        trendingScore: stats?.trending_score || 0,
      };
    }));
    setHasMore(sortedApps.length > PAGE_SIZE);
    setLoading(false);
  }, [filters]);

  const handleLoadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const start = nextPage * PAGE_SIZE;
    const sliced = allTrendingApps.slice(start, start + PAGE_SIZE);

    if (sliced.length === 0) { setHasMore(false); setLoadingMore(false); return; }

    const userIds = [...new Set(sliced.map((a: any) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    const mapped = sliced.map((app: any) => {
      const profile = profileMap.get(app.user_id);
      return {
        id: app.id, slug: app.slug || undefined, rank: app.rank,
        appName: app.app_name, appIcon: app.app_icon_url || "📱",
        publisherName: profile?.display_name || profile?.username || "Unknown",
        publisherAvatar: (profile?.display_name || "U").charAt(0), verified: false,
        timeAgo: getTimeAgo(app.created_at), caption: app.caption || app.tagline || "",
        tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
        techStack: app.tech_stack || [], likes: app.likes_count || 0, comments: app.comments_count || 0,
        views: app.views_count || 0, liked: false, saved: false,
        trendLabel: "", growthPercent: 0,
        trendingScore: app.trendingScore || 0,
      };
    });

    setApps(prev => [...prev, ...mapped]);
    setPage(nextPage);
    setHasMore(start + PAGE_SIZE < allTrendingApps.length);
    setLoadingMore(false);
  }, [page, allTrendingApps]);

  useEffect(() => {
    sessionStorage.setItem("trending-filters", JSON.stringify(filters));
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("animate-reveal"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, apps]);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="pt-16 pb-20 md:pb-8">
        <FeedLayout sidebar={<TrendingSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="min-h-[600px] flex flex-col relative">
              <div className={`sticky top-14 z-30 bg-background/95 backdrop-blur-sm border-b border-border/40 py-1 px-4 sm:px-6 transition-transform duration-300 ${showFilters ? "translate-y-0" : "-translate-y-full"}`}>
                <TrendingFilters onOpenSidebar={onOpenSidebar} onFilterChange={setFilters} />
              </div>
              <div className="flex-1 pt-2">
                {loading ? <FeedSkeleton /> : (
                  <div>
                    {apps.map((app, i) => (
                      <div key={app.id} ref={(el) => { if (el) cardRefs.current.set(app.id, el); }} className="opacity-0" style={{ animationDelay: `${i * 60}ms` }}>
                        <TrendingCard app={app} />
                      </div>
                    ))}
                    {apps.length === 0 && (
                      <div className="text-center py-16 px-6">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-4">
                          <Rocket size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No trending apps yet</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
                          Be the first to publish an app and start trending in the community.
                        </p>
                        <Button size="sm" className="rounded-full text-xs" onClick={() => navigate("/publish")}>
                          Publish an App
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                {!loading && hasMore && apps.length > 0 && (
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

export default Trending;
