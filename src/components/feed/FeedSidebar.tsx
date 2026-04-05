import { useState, useEffect } from "react";
import { ArrowRight, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const FeedSidebar = () => {
  const navigate = useNavigate();
  const [topCreators, setTopCreators] = useState<{ name: string; handle: string; apps: number; userId: string }[]>([]);
  const [mostRated, setMostRated] = useState<{ name: string; rating: string; count: string }[]>([]);
  const [mostReviewed, setMostReviewed] = useState<{ name: string; comments: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Top creators by app count
      const { data: apps } = await supabase.from("apps").select("user_id").eq("status", "published");
      if (apps && apps.length > 0) {
        const counts = new Map<string, number>();
        apps.forEach(a => counts.set(a.user_id, (counts.get(a.user_id) || 0) + 1));
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
        const userIds = sorted.map(s => s[0]);
        const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username").in("user_id", userIds);
        const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
        setTopCreators(sorted.map(([uid, count]) => {
          const p = profileMap.get(uid);
          return { name: p?.display_name || p?.username || "Unknown", handle: `@${p?.username || "user"}`, apps: count, userId: uid };
        }));
      }

      // Most rated apps
      const { data: ratings } = await supabase.from("ratings").select("app_id, rating");
      if (ratings && ratings.length > 0) {
        const appRatings = new Map<string, { sum: number; count: number }>();
        ratings.forEach(r => {
          const prev = appRatings.get(r.app_id) || { sum: 0, count: 0 };
          appRatings.set(r.app_id, { sum: prev.sum + r.rating, count: prev.count + 1 });
        });
        const sorted = [...appRatings.entries()].sort((a, b) => (b[1].sum / b[1].count) - (a[1].sum / a[1].count)).slice(0, 2);
        const appIds = sorted.map(s => s[0]);
        const { data: appNames } = await supabase.from("apps").select("id, app_name").in("id", appIds);
        const nameMap = new Map((appNames || []).map(a => [a.id, a.app_name]));
        setMostRated(sorted.map(([id, data]) => ({
          name: nameMap.get(id) || "Unknown",
          rating: (data.sum / data.count).toFixed(1),
          count: String(data.count),
        })));
      }

      // Most reviewed apps
      const { data: comments } = await supabase.from("comments").select("app_id");
      if (comments && comments.length > 0) {
        const counts = new Map<string, number>();
        comments.forEach(c => counts.set(c.app_id, (counts.get(c.app_id) || 0) + 1));
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2);
        const appIds = sorted.map(s => s[0]);
        const { data: appNames } = await supabase.from("apps").select("id, app_name").in("id", appIds);
        const nameMap = new Map((appNames || []).map(a => [a.id, a.app_name]));
        setMostReviewed(sorted.map(([id, count]) => ({
          name: nameMap.get(id) || "Unknown",
          comments: String(count),
        })));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Creators */}
      {topCreators.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Top Creators This Week
          </h3>
          <div className="space-y-3">
            {topCreators.map((creator, i) => (
              <div
                key={creator.handle}
                className="flex items-center gap-3 px-1 cursor-pointer hover:bg-secondary/50 rounded-lg py-1 transition-colors"
                onClick={() => navigate(`/profile/${creator.userId}`)}
              >
                <span className="text-xs font-bold text-muted-foreground/40 tabular-nums w-4">
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                  {creator.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                  <p className="text-[11px] text-muted-foreground">{creator.apps} projects</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground/30 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Rated */}
      {mostRated.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Most Rated
          </h3>
          <div className="space-y-3">
            {mostRated.map((app) => (
              <div key={app.name} className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <Star size={14} className="text-primary fill-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                  <p className="text-[11px] text-muted-foreground">{app.rating} ({app.count} ratings)</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Reviewed */}
      {mostReviewed.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Most Reviewed
          </h3>
          <div className="space-y-3">
            {mostReviewed.map((app) => (
              <div key={app.name} className="flex items-center gap-3 px-1">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <MessageSquare size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                  <p className="text-[11px] text-muted-foreground">{app.comments} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish CTA */}
      <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-3 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Built something cool?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">Share your project with the community and get real feedback.</p>
        <button
          onClick={() => navigate("/publish")}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Publish your app <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default FeedSidebar;
