import { useState, useEffect, useRef, useCallback } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import TrendingFilters from "@/components/trending/TrendingFilters";
import type { TrendingFilterState } from "@/components/trending/TrendingFilters";
import TrendingSidebar from "@/components/trending/TrendingSidebar";
import TrendingCard from "@/components/trending/TrendingCard";
import FeedLayout from "@/components/layout/FeedLayout";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { supabase } from "@/integrations/supabase/client";
import type { TrendingApp } from "@/data/mockTrending";
import { cn } from "@/lib/utils";

const Trending = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<(TrendingApp & { slug?: string })[]>([]);
  const [filters, setFilters] = useState<TrendingFilterState>({ time: "This Week", category: "" });
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [showFilters, setShowFilters] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowFilters(false);
      } else {
        setShowFilters(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchTrending = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("apps")
      .select("*")
      .eq("status", "published");

    // Time filter
    const now = new Date();
    if (filters.time === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      query = query.gte("created_at", today);
    } else if (filters.time === "This Week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", weekAgo);
    } else if (filters.time === "This Month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", monthAgo);
    }

    // Category filter
    if (filters.category) {
      const tag = filters.category.toLowerCase().replace(/\s+/g, "-");
      query = query.contains("tags", [tag]);
    }

    query = query.order("views_count", { ascending: false }).limit(20);

    const { data: rawApps } = await query;

    if (!rawApps || rawApps.length === 0) {
      setApps([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(rawApps.map((a) => a.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username")
      .in("user_id", userIds);

    const profileMap = new Map(
      (profiles || []).map((p) => [p.user_id, p])
    );

    const mapped = rawApps.map((app, i) => {
      const profile = profileMap.get(app.user_id);
      return {
        id: app.id,
        slug: (app as any).slug || undefined,
        rank: i + 1,
        appName: app.app_name,
        appIcon: app.app_icon_url || "📱",
        publisherName: profile?.display_name || profile?.username || "Unknown",
        publisherAvatar: (profile?.display_name || "U").charAt(0),
        verified: false,
        timeAgo: getTimeAgo(app.created_at),
        caption: app.caption || app.tagline || "",
        tags: app.tags || [],
        platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
        techStack: app.tech_stack || [],
        likes: app.likes_count || 0,
        comments: app.comments_count || 0,
        views: app.views_count || 0,
        liked: false,
        saved: false,
        trendLabel: getTrendLabel(i),
        growthPercent: Math.floor(Math.random() * 80) + 10,
      };
    });

    setApps(mapped);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, apps]);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <FeedNavbar />

      <main className="pt-20 pb-24 md:pb-8">
        <FeedLayout sidebar={<TrendingSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="space-y-6">
              <div className={cn(
                "sticky top-[64px] z-30 bg-background/80 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all duration-300",
                showFilters ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
              )}>
                <TrendingFilters onOpenSidebar={onOpenSidebar} onFilterChange={setFilters} />
              </div>

              <div className="mt-4">
                {loading ? (
                  <FeedSkeleton />
                ) : (
                  <div className="grid grid-cols-1 gap-6 w-full">
                    {apps.map((app, i) => (
                      <div
                        key={app.id}
                        ref={(el) => {
                          if (el) cardRefs.current.set(app.id, el);
                        }}
                        className="opacity-0 w-full"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <TrendingCard app={app} />
                      </div>
                    ))}
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
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

function getTrendLabel(rank: number): string {
  if (rank === 0) return "🔥 #1 Trending";
  if (rank < 3) return "Rising fast";
  if (rank < 6) return "Trending";
  return "Growing";
}

export default Trending;
