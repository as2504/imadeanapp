import { useState, useEffect, useRef } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import FeedFilters from "@/components/feed/FeedFilters";
import FeedSidebar from "@/components/feed/FeedSidebar";
import FeedLayout from "@/components/layout/FeedLayout";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import EmptyFeed from "@/components/feed/EmptyFeed";
import { supabase } from "@/integrations/supabase/client";

const HomeFeed = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<AppPost[]>([]);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      const { data: apps } = await supabase
        .from("apps")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (!apps || apps.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // Get unique user_ids and fetch profiles
      const userIds = [...new Set(apps.map((a) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      const mapped: AppPost[] = apps.map((app) => {
        const profile = profileMap.get(app.user_id);
        return {
          id: app.id,
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
        };
      });

      setPosts(mapped);
      setLoading(false);
    };

    fetchApps();
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
  }, [loading, posts]);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />

      <main className="pt-20 pb-24 md:pb-8">
        <FeedLayout sidebar={<FeedSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="space-y-5">
              <FeedFilters onOpenSidebar={onOpenSidebar} />

              {loading ? (
                <FeedSkeleton />
              ) : posts.length === 0 ? (
                <EmptyFeed />
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <div
                      key={post.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(post.id, el);
                      }}
                      className="opacity-0"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <AppCard post={post} />
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

export default HomeFeed;
