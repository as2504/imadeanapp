import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";

const ProfileSavedApps = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      const { data: saved } = await supabase.from("saved_apps" as any).select("app_id").eq("user_id", user.id);
      if (!saved || saved.length === 0) { setApps([]); setLoading(false); return; }
      const appIds = saved.map((s: any) => s.app_id);
      const { data: rawApps } = await supabase.from("apps").select("*").in("id", appIds);
      if (!rawApps || rawApps.length === 0) { setApps([]); setLoading(false); return; }
      const userIds = [...new Set(rawApps.map((a) => a.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      setApps(rawApps.map((app) => {
        const profile = profileMap.get(app.user_id);
        return {
          id: app.id, slug: app.slug || undefined, appName: app.app_name,
          appIcon: app.app_icon_url || "📱", publisherName: profile?.display_name || profile?.username || "Unknown",
          publisherAvatar: (profile?.display_name || "U").charAt(0), verified: false,
          timeAgo: "", caption: app.caption || app.tagline || "",
          tags: app.tags || [], platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
          likes: app.likes_count || 0, comments: app.comments_count || 0, views: app.views_count || 0,
          liked: false, saved: true,
        };
      }));
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) return <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>;

  if (apps.length === 0) return (
    <div className="text-center py-20 space-y-3">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Bookmark size={20} className="text-muted-foreground" />
      </div>
      <p className="text-foreground font-medium">No saved apps yet</p>
      <p className="text-sm text-muted-foreground">Bookmark apps from the feed to revisit them later.</p>
    </div>
  );

  return (
    <div className="space-y-1">
      {apps.map((app) => <AppCard key={app.id} post={app} />)}
    </div>
  );
};

export default ProfileSavedApps;
