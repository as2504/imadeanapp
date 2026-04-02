import { useState, useEffect } from "react";
import { LayoutGrid, Users, MessageSquare, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ProfileStatsStripProps {
  profileUserId?: string;
}

const ProfileStatsStrip = ({ profileUserId }: ProfileStatsStripProps) => {
  const { user } = useAuth();
  const targetUserId = profileUserId || user?.id;
  const [stats, setStats] = useState({ apps: 0, followers: 0, comments: 0, views: 0 });

  useEffect(() => {
    if (!targetUserId) return;

    const fetchStats = async () => {
      // Apps count
      const { count: appsCount } = await supabase
        .from("apps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId)
        .eq("status", "published");

      // Followers count
      const { count: followersCount } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);

      // Comments count
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      // Total views across apps
      const { data: apps } = await supabase
        .from("apps")
        .select("views_count")
        .eq("user_id", targetUserId)
        .eq("status", "published");

      const totalViews = (apps || []).reduce((sum, a) => sum + (a.views_count || 0), 0);

      setStats({
        apps: appsCount || 0,
        followers: followersCount || 0,
        comments: commentsCount || 0,
        views: totalViews,
      });
    };

    fetchStats();
  }, [targetUserId]);

  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const quickStats = [
    { icon: LayoutGrid, value: formatNum(stats.apps), label: "Apps", color: "text-primary" },
    { icon: Users, value: formatNum(stats.followers), label: "Followers", color: "text-blue-500" },
    { icon: MessageSquare, value: formatNum(stats.comments), label: "Comments", color: "text-sky-500" },
    { icon: Eye, value: formatNum(stats.views), label: "Views", color: "text-amber-500" },
  ];

  const [isExtraSmall, setIsExtraSmall] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsExtraSmall(window.innerWidth < 300);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className={cn(
      "grid gap-3 p-4 bg-card border border-border/40 rounded-3xl shadow-sm",
      isExtraSmall ? "grid-cols-1" : "grid-cols-2 md:grid-cols-4"
    )}>
      {quickStats.map((s) => (
        <div key={s.label} className="flex items-center gap-4 p-3 rounded-2xl bg-surface/30 border border-border/20 group hover:border-primary/20 transition-all flex-1">
          <div className={`p-2 rounded-xl bg-background group-hover:scale-110 transition-transform ${s.color}`}>
            <s.icon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground leading-none">{s.value}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.1em] font-black mt-1">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStatsStrip;
