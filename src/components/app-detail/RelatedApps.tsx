import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface RelatedAppsProps {
  currentId: string;
  currentTags?: string[];
}

interface RelatedApp {
  id: string;
  slug: string | null;
  name: string;
  icon: string;
  tag: string;
  avgRating: number;
}

const RelatedApps = ({ currentId, currentTags }: RelatedAppsProps) => {
  const navigate = useNavigate();
  const [related, setRelated] = useState<RelatedApp[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      // Fetch published apps excluding current
      const { data: apps } = await supabase
        .from("apps")
        .select("id, slug, app_name, app_icon_url, tags")
        .eq("status", "published")
        .neq("id", currentId)
        .limit(6);

      if (!apps || apps.length === 0) {
        setRelated([]);
        return;
      }

      // Sort by tag overlap
      const sorted = [...apps].sort((a, b) => {
        const aOverlap = (a.tags || []).filter((t) => currentTags?.includes(t)).length;
        const bOverlap = (b.tags || []).filter((t) => currentTags?.includes(t)).length;
        return bOverlap - aOverlap;
      }).slice(0, 3);

      // Fetch ratings for related apps
      const ids = sorted.map((a) => a.id);
      const { data: ratings } = await supabase
        .from("ratings")
        .select("app_id, rating")
        .in("app_id", ids);

      const ratingMap = new Map<string, number[]>();
      (ratings || []).forEach((r) => {
        if (!ratingMap.has(r.app_id)) ratingMap.set(r.app_id, []);
        ratingMap.get(r.app_id)!.push(r.rating);
      });

      setRelated(
        sorted.map((app) => {
          const arr = ratingMap.get(app.id) || [];
          const avg = arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
          return {
            id: app.id,
            slug: app.slug,
            name: app.app_name,
            icon: app.app_icon_url || "📱",
            tag: (app.tags || [])[0] || "App",
            avgRating: Math.round(avg * 10) / 10,
          };
        })
      );
    };

    fetchRelated();
  }, [currentId, currentTags]);

  if (related.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          Related Apps
        </h2>
      </div>

      <div className="space-y-4">
        {related.map((app) => (
          <button
            key={app.id}
            onClick={() => navigate(`/app/${app.slug || app.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl border border-border/20 overflow-hidden shrink-0 shadow-sm">
              {app.icon.startsWith("http") || app.icon.startsWith("/") ? (
                <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl bg-muted">{app.icon}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-foreground truncate uppercase tracking-tight">
                {app.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  {app.tag}
                </span>
                {app.avgRating > 0 && (
                  <>
                    <span className="text-[10px] text-muted-foreground/20">·</span>
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-muted-foreground/60">{app.avgRating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="p-2 rounded-lg bg-surface text-muted-foreground/40 group-hover:text-primary transition-colors">
              <ExternalLink size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* Mini CTA card */}
      <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
          <Star size={100} className="text-white fill-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-black leading-tight tracking-tight uppercase">
            Ready to launch?
          </h3>
          <p className="text-xs text-primary-foreground/70 mt-2 leading-relaxed font-medium">
            Join creators and get your app featured globally.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6 w-full rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-transparent font-black text-[10px] uppercase tracking-widest shadow-lg h-10"
            onClick={(e) => { e.stopPropagation(); navigate("/publish"); }}
          >
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatedApps;
