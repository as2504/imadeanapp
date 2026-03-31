import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";
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
      if (!currentTags || currentTags.length === 0) {
        // No tags to match, just fetch latest
        const { data: apps } = await supabase.from("apps").select("id, slug, app_name, app_icon_url, tags").eq("status", "published").neq("id", currentId).limit(4);
        if (apps) await enrichAndSetRelated(apps);
        return;
      }

      const primaryTag = currentTags[0];
      
      // 1. Try to find apps with the same primary tag
      const { data: taggedApps } = await supabase
        .from("apps")
        .select("id, slug, app_name, app_icon_url, tags")
        .eq("status", "published")
        .neq("id", currentId)
        .contains("tags", [primaryTag])
        .limit(4);

      let finalApps = taggedApps || [];

      // 2. If we have less than 4, fill with other apps
      if (finalApps.length < 4) {
        const existingIds = finalApps.map(a => a.id);
        const { data: fallbackApps } = await supabase
          .from("apps")
          .select("id, slug, app_name, app_icon_url, tags")
          .eq("status", "published")
          .neq("id", currentId)
          .not("id", "in", `(${[currentId, ...existingIds].join(',')})`)
          .limit(4 - finalApps.length);
        
        if (fallbackApps) finalApps = [...finalApps, ...fallbackApps];
      }

      await enrichAndSetRelated(finalApps);
    };

    const enrichAndSetRelated = async (apps: any[]) => {
      if (!apps || apps.length === 0) { setRelated([]); return; }
      
      const ids = apps.map((a) => a.id);
      const { data: ratings } = await supabase.from("ratings").select("app_id, rating").in("app_id", ids);
      const ratingMap = new Map<string, number[]>();
      (ratings || []).forEach((r) => { if (!ratingMap.has(r.app_id)) ratingMap.set(r.app_id, []); ratingMap.get(r.app_id)!.push(r.rating); });

      setRelated(apps.map((app) => {
        const arr = ratingMap.get(app.id) || [];
        const avg = arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
        return { 
          id: app.id, 
          slug: app.slug, 
          name: app.app_name, 
          icon: app.app_icon_url || "📱", 
          tag: (app.tags || [])[0] || "App", 
          avgRating: Math.round(avg * 10) / 10 
        };
      }));
    };
    fetchRelated();
  }, [currentId, currentTags]);

  if (related.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Related Apps</h3>
      <div className="space-y-2">
        {related.map((app) => (
          <button
            key={app.id}
            onClick={() => navigate(`/app/${app.slug || app.id}`)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-card transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary overflow-hidden shrink-0">
              {app.icon.startsWith("http") || app.icon.startsWith("/") ? (
                <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg bg-secondary">{app.icon}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">{app.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-muted-foreground">{app.tag}</span>
                {app.avgRating > 0 && (
                  <>
                    <span className="text-muted-foreground/20">·</span>
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="fill-primary text-primary" />
                      <span className="text-[11px] text-muted-foreground">{app.avgRating.toFixed(1)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-card border border-border/40 rounded-lg p-5 space-y-3 mt-4">
        <p className="text-sm font-semibold text-foreground">Ready to launch?</p>
        <p className="text-xs text-muted-foreground">Join creators and get your app featured globally.</p>
        <button onClick={() => navigate("/publish")} className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          Publish Now <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RelatedApps;
