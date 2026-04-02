import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TrendingSidebar = () => {
  const navigate = useNavigate();
  const [trendingTech, setTrendingTech] = useState<{ name: string; count: number }[]>([]);
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: apps } = await supabase.from("apps").select("tech_stack, tags").eq("status", "published");
      if (!apps) return;

      // Aggregate tech stacks
      const techCounts = new Map<string, number>();
      apps.forEach(a => (a.tech_stack || []).forEach((t: string) => techCounts.set(t, (techCounts.get(t) || 0) + 1)));
      setTrendingTech([...techCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })));

      // Aggregate tags
      const tagCounts = new Map<string, number>();
      apps.forEach(a => (a.tags || []).forEach((t: string) => tagCounts.set(t, (tagCounts.get(t) || 0) + 1)));
      setTrendingTags([...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({ tag, count })));
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-5">
      {/* Trending Tech */}
      {trendingTech.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Trending Tech
          </h3>
          <div className="space-y-3">
            {trendingTech.map((tech, i) => (
              <div key={tech.name} className="flex items-center gap-3 px-1">
                <span className="text-xs font-bold text-muted-foreground/40 tabular-nums w-4">
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-primary fill-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                  <p className="text-[11px] text-muted-foreground">{tech.count} projects</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
            Trending Tags
          </h3>
          <div className="space-y-0.5">
            {trendingTags.map((item) => (
              <button
                key={item.tag}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Hash size={12} className="text-muted-foreground/40" />
                  <span className="text-sm text-foreground">#{item.tag}</span>
                </div>
                <span className="text-xs text-muted-foreground">{item.count}</span>
              </button>
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

export default TrendingSidebar;
