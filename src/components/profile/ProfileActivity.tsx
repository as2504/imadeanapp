import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  icon: string;
  text: string;
  subtext: string;
  time: string;
  color: string;
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const ProfileActivity = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchActivity = async () => {
      setLoading(true);
      const items: ActivityItem[] = [];

      // Fetch all activity sources in parallel
      const [publishedRes, updatesRes, commentsRes, savedRes, profileRes] = await Promise.all([
        supabase.from("apps").select("app_name, created_at, status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("app_updates").select("version_notes, created_at, app_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("comments").select("text, created_at, app_id").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("saved_apps").select("app_id, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("profiles").select("created_at").eq("user_id", user.id).maybeSingle(),
      ]);

      // Collect all app_ids we need names for
      const appIds = new Set<string>();
      (updatesRes.data || []).forEach(u => appIds.add(u.app_id));
      (commentsRes.data || []).forEach(c => appIds.add(c.app_id));
      (savedRes.data || []).forEach(s => appIds.add(s.app_id));

      let appNameMap = new Map<string, string>();
      if (appIds.size > 0) {
        const { data: apps } = await supabase.from("apps").select("id, app_name").in("id", [...appIds]);
        appNameMap = new Map((apps || []).map(a => [a.id, a.app_name]));
      }

      // Published apps
      (publishedRes.data || []).forEach(app => {
        if (app.status === "published") {
          items.push({ icon: "🚀", text: `Published ${app.app_name}`, subtext: "to the Public Gallery", time: app.created_at, color: "bg-blue-500/10 text-blue-500" });
        } else {
          items.push({ icon: "📝", text: `Created draft: ${app.app_name}`, subtext: "", time: app.created_at, color: "bg-slate-500/10 text-slate-500" });
        }
      });

      // App updates
      (updatesRes.data || []).forEach(u => {
        const name = appNameMap.get(u.app_id) || "an app";
        items.push({ icon: "🔧", text: `Updated ${name}`, subtext: u.version_notes, time: u.created_at, color: "bg-emerald-500/10 text-emerald-500" });
      });

      // Comments
      (commentsRes.data || []).forEach(c => {
        const name = appNameMap.get(c.app_id) || "an app";
        items.push({ icon: "💬", text: `Commented on ${name}`, subtext: c.text.length > 60 ? c.text.slice(0, 60) + "…" : c.text, time: c.created_at, color: "bg-sky-500/10 text-sky-500" });
      });

      // Saved apps
      (savedRes.data || []).forEach(s => {
        const name = appNameMap.get(s.app_id) || "an app";
        items.push({ icon: "🔖", text: `Saved ${name}`, subtext: "", time: s.created_at, color: "bg-amber-500/10 text-amber-500" });
      });

      // Joined date
      if (profileRes.data) {
        const joinDate = new Date(profileRes.data.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
        items.push({ icon: "🎉", text: "Joined imadeanapp", subtext: `on ${joinDate}`, time: profileRes.data.created_at, color: "bg-indigo-500/10 text-indigo-500" });
      }

      // Sort by time descending
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setActivities(items);
      setLoading(false);
    };
    fetchActivity();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-sm">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-secondary rounded w-3/4" />
                <div className="h-2 bg-secondary rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-sm text-center">
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          Recent Activity
        </h3>
      </div>

      <div className="relative space-y-8">
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/20 via-border/40 to-transparent" />

        {activities.map((item, i) => (
          <div key={i} className="relative flex gap-6 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl z-10 shadow-sm border border-border/20 group-hover:scale-110 transition-all duration-300 shrink-0 ${item.color} bg-background`}>
              {item.icon}
            </div>

            <div className="flex-1 pt-1 pb-4 border-b border-border/20 last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.text}
                </p>
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest bg-surface px-2 py-1 rounded-lg shrink-0">
                  {timeAgo(item.time)}
                </span>
              </div>
              {item.subtext && (
                <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                  {item.subtext}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileActivity;
