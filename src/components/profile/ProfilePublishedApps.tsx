import { useState, useEffect } from "react";
import { Heart, MessageSquare, Eye, Globe, Smartphone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

const platformIcon: Record<string, React.ReactNode> = {
  web: <Globe size={12} />,
  ios: <Smartphone size={12} />,
  android: <Smartphone size={12} />,
};

const ProfilePublishedApps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Tables<"apps">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("apps")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setApps(data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (loading) {
    return <div className="py-10 text-center text-muted-foreground text-sm">Loading...</div>;
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">📦</p>
        <p className="text-foreground font-medium">You haven't published anything yet</p>
        <p className="text-sm text-muted-foreground">Share your first vibe-coded app with the world.</p>
        <Button size="sm" className="rounded-full mt-2" onClick={() => navigate("/publish")}>Publish Your First App</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {apps.map((app) => (
        <div
          key={app.id}
          className="rounded-xl border border-border/50 p-5 hover:shadow-sm transition-shadow group cursor-pointer"
          onClick={() => navigate(`/app/${app.id}`)}
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0 overflow-hidden">
              {app.app_icon_url ? (
                <img src={app.app_icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                "📱"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{app.app_name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {app.caption || app.tagline}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {(app.tags || []).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-surface text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart size={12} /> {app.likes_count || 0}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {app.comments_count || 0}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {app.views_count || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground/60">
                {(app.platforms || []).map((p) => (
                  <span key={p}>{platformIcon[p]}</span>
                ))}
              </div>
              <button
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Pencil size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePublishedApps;
