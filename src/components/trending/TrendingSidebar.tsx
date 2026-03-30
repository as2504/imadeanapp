import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Hash } from "lucide-react";

const trendingTech = [
  { name: "React", count: "2.8k" },
  { name: "Next.js", count: "2.1k" },
  { name: "Supabase", count: "1.5k" },
  { name: "Tailwind", count: "1.2k" },
  { name: "OpenAI", count: "950" },
];

const trendingTags = [
  { tag: "AI", count: "2.4k" },
  { tag: "Productivity", count: "1.8k" },
  { tag: "No-Code", count: "1.2k" },
  { tag: "SaaS", count: "980" },
  { tag: "Automation", count: "756" },
];

const TrendingSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Trending Tech */}
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

      {/* Trending Tags */}
      <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Trending Tags
        </h3>
        <div className="space-y-0.5">
          {trendingTags.slice(0, 5).map((item) => (
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
