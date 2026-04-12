import { useState, useEffect } from "react";
import { LayoutGrid, Star, MousePointerClick, MessageSquare, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProfileStatsStripProps {
  profileUserId?: string;
}

const ProfileStatsStrip = ({ profileUserId }: ProfileStatsStripProps) => {
  const { user } = useAuth();
  const targetUserId = profileUserId || user?.id;
  const [stats, setStats] = useState({
    apps: 0,
    avgRating: null as number | null,
    totalTries: 0,
    reviewsGiven: 0,
    profileViews: 0,
  });

  useEffect(() => {
    if (!targetUserId) return;

    const fetchStats = async () => {
      // Published apps count
      const { count: appsCount } = await supabase
        .from("apps")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId)
        .eq("status", "published");

      // Get published app IDs for aggregate queries
      const { data: publishedApps } = await supabase
        .from("apps")
        .select("id")
        .eq("user_id", targetUserId)
        .eq("status", "published");

      const appIds = (publishedApps || []).map((a) => a.id);

      // Average rating across all published apps
      let avgRating: number | null = null;
      if (appIds.length > 0) {
        const { data: ratings } = await supabase
          .from("ratings")
          .select("rating")
          .in("app_id", appIds);
        if (ratings && ratings.length > 0) {
          const sum = ratings.reduce((s, r) => s + r.rating, 0);
          avgRating = Math.round((sum / ratings.length) * 10) / 10;
        }
      }

      // Total unique tries (unique users who clicked on any published app)
      let totalTries = 0;
      if (appIds.length > 0) {
        const { data: clicks } = await supabase
          .from("app_clicks")
          .select("user_id, app_id")
          .in("app_id", appIds);
        if (clicks) {
          const uniqueUsers = new Set(clicks.map((c) => c.user_id));
          totalTries = uniqueUsers.size;
        }
      }

      // Reviews given by this user to other apps
      const { count: reviewsGiven } = await supabase
        .from("ratings")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      // Profile views (unique viewers)
      const { count: profileViews } = await supabase
        .from("profile_views")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      setStats({
        apps: appsCount || 0,
        avgRating,
        totalTries,
        reviewsGiven: reviewsGiven || 0,
        profileViews: profileViews || 0,
      });
    };

    fetchStats();
  }, [targetUserId]);

  const formatNum = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={12} className="fill-amber-400 text-amber-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} size={12} className="fill-amber-400/50 text-amber-400" />);
      } else {
        stars.push(<Star key={i} size={12} className="text-muted-foreground/30" />);
      }
    }
    return stars;
  };

  const quickStats = [
    {
      key: "apps",
      value: formatNum(stats.apps),
      label: "APPS",
      tooltip: "Number of published apps",
    },
    {
      key: "avgRating",
      value: stats.avgRating !== null ? stats.avgRating.toFixed(1) : "N/A",
      label: "AVG. RATING",
      tooltip: "Average rating across all published apps",
      showStars: true,
      rating: stats.avgRating,
    },
    {
      key: "totalTries",
      value: stats.totalTries > 0 ? formatNum(stats.totalTries) : "N/A",
      label: "TOTAL TRIES",
      tooltip: "Unique users who tried the published apps",
    },
    {
      key: "reviewsGiven",
      value: formatNum(stats.reviewsGiven),
      label: "REVIEWS GIVEN",
      tooltip: "Reviews given to other applications",
    },
    {
      key: "profileViews",
      value: formatNum(stats.profileViews),
      label: "PROFILE VIEWS",
      tooltip: "Profile views by unique users",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 bg-card border border-border/40 rounded-2xl overflow-hidden">
      {quickStats.map((s, idx) => (
        <Tooltip key={s.key}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex flex-col items-center justify-center py-5 px-3 cursor-default transition-colors hover:bg-secondary/30",
                idx < quickStats.length - 1 && "border-r border-border/30",
                // On mobile 2-col grid, remove right border on even items in last row
              )}
            >
              {s.showStars && s.rating !== null ? (
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex gap-0.5">{renderStars(s.rating!)}</div>
                  <span className="text-xl font-black text-foreground leading-none">{s.value}</span>
                </div>
              ) : (
                <span className={cn(
                  "text-2xl font-black leading-none",
                  s.value === "N/A" ? "text-muted-foreground" : "text-foreground"
                )}>
                  {s.value}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-semibold mt-2">
                {s.label}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {s.tooltip}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default ProfileStatsStrip;
