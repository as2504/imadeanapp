import { useState, useEffect, useRef } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import TrendingFilters from "@/components/trending/TrendingFilters";
import TrendingSidebar from "@/components/trending/TrendingSidebar";
import TrendingCard from "@/components/trending/TrendingCard";
import FeedLayout from "@/components/layout/FeedLayout";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { supabase } from "@/integrations/supabase/client";
import type { TrendingApp } from "@/data/mockTrending";

const Trending = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<TrendingApp[]>([]);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      const { data: rawApps } = await supabase
        .from("apps")
        .select("*")
        .eq("status", "published")
        .order("likes_count", { ascending: false })
        .limit(20);

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

      const mapped: TrendingApp[] = rawApps.map((app, i) => {
        const profile = profileMap.get(app.user_id);
        return {
          id: app.id,
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
    };

    fetchTrending();
  }, []);

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
    <div className="min-h-screen bg-background">
      <FeedNavbar />

      <main className="pt-20 pb-24 md:pb-8">
        <FeedLayout sidebar={<TrendingSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="space-y-5">
              <TrendingFilters onOpenSidebar={onOpenSidebar} />

              {loading ? (
                <FeedSkeleton />
              ) : (
                <div className="space-y-4">
                  {apps.map((app, i) => (
                    <div
                      key={app.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(app.id, el);
                      }}
                      className="opacity-0"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <TrendingCard app={app} />
                    </div>
                  ))}
                </div>
              )}
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
