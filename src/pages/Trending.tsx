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

const timeFilterMap: Record<string, string> = {
  "Today": "today",
  "This Week": "week",
  "This Month": "month",
  "All Time": "all",
};

const Trending = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<(TrendingApp & { slug?: string })[]>([]);
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
    const tf = timeFilterMap[filters.time] || "week";

    // Call the trending RPC
    const { data: trendingData, error } = await (supabase as any).rpc("get_trending_apps", {
      time_filter: tf,
      max_results: 20,
    });

    if (error || !trendingData || trendingData.length === 0) {
      setApps([]);
      setLoading(false);
      return;
    }

    const appIds = trendingData.map((t: any) => t.app_id);
    const trendingMap = new Map(trendingData.map((t: any) => [t.app_id, t]));

    // Fetch full app data
    let query = supabase.from("apps").select("*").in("id", appIds).eq("status", "published");
    if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);
    const { data: rawApps } = await query;

    if (!rawApps || rawApps.length === 0) { setApps([]); setLoading(false); return; }

    // Sort by trending score
    const sortedApps = rawApps.sort((a, b) => {
      const scoreA = (trendingMap.get(a.id) as any)?.trending_score || 0;
      const scoreB = (trendingMap.get(b.id) as any)?.trending_score || 0;
      return scoreB - scoreA;
    });

    const userIds = [...new Set(sortedApps.map((a) => a.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    setApps(sortedApps.map((app, i) => {
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
    setLoading(false);
  }, [filters]);

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
                      <div className="text-center py-16">
                        <p className="text-muted-foreground italic text-sm">No trending apps found for this time period.</p>
                      </div>
                    )}
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

export default Trending;
