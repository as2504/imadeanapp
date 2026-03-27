import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { TrendingApp } from "@/data/mockTrending";

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const isUrl = (str: string) => str.startsWith("http") || str.startsWith("/");

const TrendingCard = ({ app }: { app: TrendingApp & { slug?: string } }) => {
  const navigate = useNavigate();
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase
        .from("ratings")
        .select("rating")
        .eq("app_id", app.id);
      if (data && data.length > 0) {
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    };
    fetchRating();
  }, [app.id]);

  return (
    <article
      onClick={() => navigate(`/app/${(app as any).slug || app.id}`)}
      className="relative bg-card hover:bg-accent/5 border border-border/40 rounded-xl p-3 sm:p-4 transition-all duration-300 group cursor-pointer flex flex-row gap-3 sm:gap-5 hover:shadow-lg hover:-translate-y-0.5 h-fit"
    >
      <div className="absolute -top-3 -left-2 text-3xl font-black text-foreground/10 dark:text-primary/20 group-hover:text-primary transition-all duration-500 italic z-20 pointer-events-none drop-shadow-sm select-none">
        {app.rank}
      </div>

      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-sm group-hover:shadow-md transition-all">
        {isUrl(app.appIcon) ? (
          <img src={app.appIcon} alt={app.appName} className="w-full h-full object-cover" />
        ) : (
          <span className="group-hover:scale-110 transition-transform">{app.appIcon}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-lg font-black text-foreground truncate group-hover:text-primary transition-colors tracking-tight">
              {app.appName}
            </h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-primary truncate">
                {app.publisherName}
              </span>
              {app.verified && (
                <CheckCircle2 size={8} className="text-primary shrink-0 sm:w-3 sm:h-3" />
              )}
              <span className="text-muted-foreground/30">·</span>
              <span className="text-[8px] sm:text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest whitespace-nowrap">
                {app.timeAgo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 mr-8">
            <div className="hidden sm:flex items-center gap-1">
              {app.platforms.map((p) => {
                const config = platformConfig[p];
                if (!config) return null;
                return <img key={p} src={config.icon} className="w-3.5 h-3.5 object-contain opacity-50 group-hover:opacity-100 transition-opacity dark:invert dark:opacity-90" alt={config.label} />;
              })}
            </div>
            {avgRating !== null && avgRating > 0 && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <Star size={10} className="text-emerald-500 fill-emerald-500 sm:w-3 sm:h-3" />
                <span className="text-[9px] sm:text-xs font-black text-foreground">{avgRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-[11px] sm:text-sm text-muted-foreground line-clamp-1 mt-1 font-medium">
          {app.caption}
        </p>
      </div>
    </article>
  );
};

export default TrendingCard;
