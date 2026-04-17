import { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
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
const APP_COLUMNS = "id, slug, app_name, app_icon_url, caption, tagline, tags, platforms, tech_stack, likes_count, comments_count, views_count, user_id, created_at";

const mapApps = (apps: any[], profileMap: Map<string, any>, ratingsMap: Map<string, number>): AppPost[] => {
  return apps.map((app) => {
    const profile = profileMap.get(app.user_id);
    return {
      id: app.id, slug: app.slug || undefined, appName: app.app_name,
      appIcon: app.app_icon_url || "📱", publisherName: profile?.display_name || profile?.username || "Unknown",
      publisherAvatar: (profile?.display_name || "U").charAt(0), verified: !!profile?.is_verified,
      timeAgo: getTimeAgo(app.created_at), caption: app.caption || app.tagline || "",
      tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
      techStack: app.tech_stack || [], likes: app.likes_count || 0, comments: app.comments_count || 0,
      views: app.views_count || 0, liked: false, saved: false,
      avgRating: ratingsMap.get(app.id) ?? null,
    };
  });
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
  const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, is_verified").in("user_id", userIds);
  return new Map((profiles || []).map(p => [p.user_id, p]));
}

const HomeFeed = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FeedFilterState>({ feed: "for-you", sort: "", platform: "all", techStack: "", category: "" });
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [showFilters, setShowFilters] = useState(true);
  const lastScrollY = useRef(0);

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

  const fetchPage = async ({ pageParam = 0 }: { pageParam?: number }): Promise<{ posts: AppPost[]; nextPage: number | null }> => {
    const useTrending = filters.feed === "for-you" && !filters.sort;

    if (useTrending) {
      const { data: trendingData } = await (supabase as any).rpc("get_trending_apps", { time_filter: "all", max_results: 50 });
      if (!trendingData || trendingData.length === 0) return fetchRegularPage(pageParam);

      const appIds = trendingData.map((t: any) => t.app_id);
      const trendingMap = new Map(trendingData.map((t: any) => [t.app_id, t]));

      let query = supabase.from("apps").select(APP_COLUMNS).in("id", appIds).eq("status", "published");
      if (filters.platform && filters.platform !== "all") query = query.contains("platforms", [filters.platform]);
      if (filters.techStack) query = query.contains("tech_stack", [filters.techStack]);
      if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);

      const { data: apps } = await query;
      if (!apps || apps.length === 0) return { posts: [], nextPage: null };

      const sortedApps = apps.sort((a, b) => {
        const scoreA = (trendingMap.get(a.id) as any)?.trending_score || 0;
        const scoreB = (trendingMap.get(b.id) as any)?.trending_score || 0;
        return scoreB - scoreA;
      });

      const sliced = sortedApps.slice(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE);
      if (sliced.length === 0) return { posts: [], nextPage: null };

      const userIds = [...new Set(sliced.map(a => a.user_id))];
      const slicedIds = sliced.map(a => a.id);
      const [profileMap, ratingsMap] = await Promise.all([fetchProfiles(userIds), batchFetchRatings(slicedIds)]);

      return {
        posts: mapApps(sliced, profileMap, ratingsMap),
        nextPage: sliced.length === PAGE_SIZE && (pageParam + 1) * PAGE_SIZE < sortedApps.length ? pageParam + 1 : null,
      };
    }

    return fetchRegularPage(pageParam);
  };

  const fetchRegularPage = async (pageParam: number): Promise<{ posts: AppPost[]; nextPage: number | null }> => {
    let followedIds: string[] = [];
    if (filters.feed === "following" && user) {
      const { data: follows } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      followedIds = (follows || []).map(f => f.following_id);
      if (followedIds.length === 0) return { posts: [], nextPage: null };
    }

    let query = supabase.from("apps").select(APP_COLUMNS).eq("status", "published");
    if (filters.feed === "following" && followedIds.length > 0) query = query.in("user_id", followedIds);
    if (filters.platform && filters.platform !== "all") query = query.contains("platforms", [filters.platform]);
    if (filters.techStack) query = query.contains("tech_stack", [filters.techStack]);
    if (filters.category) query = query.contains("tags", [filters.category.toLowerCase().replace(/\s+/g, "-")]);

    if (filters.sort === "liked" || filters.sort === "rated") query = query.order("likes_count", { ascending: false });
    else if (filters.sort === "viewed") query = query.order("views_count", { ascending: false });
    else if (filters.sort === "recent") query = query.order("created_at", { ascending: false });
    else if (filters.feed === "trending") query = query.order("views_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const from = pageParam * PAGE_SIZE;
    const { data: apps } = await query.range(from, from + PAGE_SIZE - 1);
    if (!apps || apps.length === 0) return { posts: [], nextPage: null };

    const userIds = [...new Set(apps.map(a => a.user_id))];
    const appIds = apps.map(a => a.id);
    const [profileMap, ratingsMap] = await Promise.all([fetchProfiles(userIds), batchFetchRatings(appIds)]);

    return {
      posts: mapApps(apps, profileMap, ratingsMap),
      nextPage: apps.length === PAGE_SIZE ? pageParam + 1 : null,
    };
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["home-feed", filters.feed, filters.sort, filters.platform, filters.techStack, filters.category, user?.id],
    queryFn: fetchPage,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });

  const posts = data?.pages.flatMap(p => p.posts) ?? [];

  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("animate-reveal"); observer.unobserve(entry.target); } });
    }, { threshold: 0.1 });
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, posts]);

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
                {isLoading ? <FeedSkeleton /> : (
                  <div>
                    {posts.map((post, i) => (
                      <div key={post.id} ref={(el) => { if (el) cardRefs.current.set(post.id, el); }} className="opacity-0" style={{ animationDelay: `${i * 60}ms` }}>
                        <AppCard post={post} />
                      </div>
                    ))}
                  </div>
                )}
                {!isLoading && posts.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground italic text-sm">No apps found matching your criteria.</p>
                  </div>
                )}
                {!isLoading && hasNextPage && posts.length > 0 && (
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

export default HomeFeed;
