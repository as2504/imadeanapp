import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
const APP_COLUMNS = "id, slug, app_name, app_icon_url, caption, tagline, tags, platforms, tech_stack, likes_count, comments_count, views_count, user_id, created_at";

const timeFilterMap: Record<string, string> = {
  "Today": "today",
  "This Week": "week",
  "This Month": "month",
  "All Time": "all",
};

async function batchFetchRatings(appIds: string[]): Promise<Map<string, number>> {
  if (appIds.length === 0) return new Map();
  const { data } = await supabase.from("ratings").select("app_id, rating").in("app_id", appIds);
  const map = new Map<string, { sum: number; count: number }>();
  (data || []).forEach(r => {
    const prev = map.get(r.app_id) || { sum: 0, count: 0 };
    map.set(r.app_id, { sum: prev.sum + r.rating, count: prev.count + 1 });
  });
  const result = new Map<string, number>();
  map.forEach((v, k) => result.set(k, Math.round((v.sum / v.count) * 10) / 10));
  return result;
}

async function fetchProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map();
  const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
  return new Map((profiles || []).map(p => [p.user_id, p]));
}

const Trending = () => {
  const navigate = useNavigate();
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
    sessionStorage.setItem("trending-filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 100) setShowFilters(true);
      else if (y < lastScrollY.current) setShowFilters(true);
      else setShowFilters(false);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchPage = async ({ pageParam = 0 }: { pageParam?: number }): Promise<{ apps: (TrendingApp & { slug?: string })[]; nextPage: number | null; allSorted: any[] }> => {
    const tf = timeFilterMap[filters.time] || "week";

    const { data: trendingData, error } = await (supabase as any).rpc("get_trending_apps", { time_filter: tf, max_results: 50 });
    if (error || !trendingData || trendingData.length === 0) return { apps: [], nextPage: null, allSorted: [] };

    const appIds = trendingData.map((t: any) => t.app_id);
    const trendingMap = new Map(trendingData.map((t: any) => [t.app_id, t]));

    let query = supabase.from("apps").select(APP_COLUMNS).in("id", appIds).eq("status", "published");
    if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);
    const { data: rawApps } = await query;

    if (!rawApps || rawApps.length === 0) return { apps: [], nextPage: null, allSorted: [] };

    const sortedApps = rawApps.sort((a, b) => {
      const scoreA = (trendingMap.get(a.id) as any)?.trending_score || 0;
      const scoreB = (trendingMap.get(b.id) as any)?.trending_score || 0;
      return scoreB - scoreA;
    });

    const sliced = sortedApps.slice(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE);
    if (sliced.length === 0) return { apps: [], nextPage: null, allSorted: sortedApps };

    const userIds = [...new Set(sliced.map(a => a.user_id))];
    const slicedIds = sliced.map(a => a.id);
    const [profileMap, ratingsMap] = await Promise.all([fetchProfiles(userIds), batchFetchRatings(slicedIds)]);

    const mapped = sliced.map((app, i) => {
      const profile = profileMap.get(app.user_id);
      const globalRank = pageParam * PAGE_SIZE + i + 1;
      return {
        id: app.id, slug: app.slug || undefined, rank: globalRank,
        appName: app.app_name, appIcon: app.app_icon_url || "📱",
        publisherName: profile?.display_name || profile?.username || "Unknown",
        publisherAvatar: (profile?.display_name || "U").charAt(0), verified: false,
        timeAgo: getTimeAgo(app.created_at), caption: app.caption || app.tagline || "",
        tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
        techStack: app.tech_stack || [], likes: app.likes_count || 0, comments: app.comments_count || 0,
        views: app.views_count || 0, liked: false, saved: false,
        trendLabel: "", growthPercent: 0,
        avgRating: ratingsMap.get(app.id) ?? null,
      };
    });

    return {
      apps: mapped,
      nextPage: sliced.length === PAGE_SIZE && (pageParam + 1) * PAGE_SIZE < sortedApps.length ? pageParam + 1 : null,
      allSorted: sortedApps,
    };
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["trending", filters.time, filters.category],
    queryFn: fetchPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const apps = data?.pages.flatMap(p => p.apps) ?? [];

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("animate-reveal"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, apps]);

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
                {isLoading ? <FeedSkeleton /> : (
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
                {!isLoading && hasNextPage && apps.length > 0 && (
                  <div className="flex justify-center py-8">
                    <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : "Load More"}
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
