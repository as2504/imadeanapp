import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";

interface ProfilePublishedAppsProps {
  profileUserId?: string;
}

const ProfilePublishedApps = ({ profileUserId }: ProfilePublishedAppsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppPost[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = profileUserId || user?.id;
  const isOwnProfile = !profileUserId || profileUserId === user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    const fetchApps = async () => {
      let query = supabase
        .from("apps")
        .select("*")
        .eq("user_id", targetUserId)
        .order("created_at", { ascending: false });

      // For other users, only show published apps
      if (!isOwnProfile) {
        query = query.eq("status", "published");
      }

      const { data } = await query;

      if (!data) {
        setApps([]);
        setLoading(false);
        return;
      }

      // Fetch profile for the publisher name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url")
        .eq("user_id", targetUserId)
        .maybeSingle();

      const publisherName = profile?.display_name || profile?.username || "User";

      const mapped: AppPost[] = data.map((app) => ({
        id: app.id,
        slug: app.slug || undefined,
        appName: app.app_name,
        appIcon: app.app_icon_url || "📱",
        publisherName,
        publisherAvatar: publisherName.charAt(0),
        verified: true,
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
      }));

      setApps(mapped);
      setLoading(false);
    };
    fetchApps();
  }, [targetUserId, isOwnProfile]);

  if (loading) {
    return <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-card border border-border/40 rounded-[2rem] shadow-sm">
        <p className="text-6xl mb-6">🚀</p>
        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">
          {isOwnProfile ? "Time to launch?" : "No apps yet"}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
          {isOwnProfile
            ? "You haven't published anything yet. Share your first vibe-coded app with the world today."
            : "This creator hasn't published any apps yet."}
        </p>
        {isOwnProfile && (
          <Button size="lg" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={() => navigate("/publish")}>
            Publish Your First App
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {apps.map((app) => (
        <AppCard key={app.id} post={app} />
      ))}
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

export default ProfilePublishedApps;
