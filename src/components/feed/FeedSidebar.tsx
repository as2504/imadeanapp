import { TrendingUp, UserPlus, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const trendingTags = [
  { tag: "AI", count: "2.4k" },
  { tag: "Productivity", count: "1.8k" },
  { tag: "No-Code", count: "1.2k" },
  { tag: "SaaS", count: "980" },
  { tag: "Automation", count: "756" },
];

const suggestedCreators = [
  { name: "Ananya Mehta", handle: "@ananya", apps: 8 },
  { name: "Leo Park", handle: "@leopark", apps: 12 },
  { name: "Sara Voss", handle: "@saravoss", apps: 5 },
];

const FeedSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Trending tags */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Trending Tags
        </h3>
        <div className="space-y-0.5">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-left"
            >
              <span className="text-sm text-foreground">#{item.tag}</span>
              <span className="text-xs text-muted-foreground">{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Suggested creators */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Creators to Follow
        </h3>
        <div className="space-y-3">
          {suggestedCreators.map((creator) => (
            <div key={creator.handle} className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-foreground">
                {creator.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                <p className="text-[11px] text-muted-foreground">{creator.apps} apps</p>
              </div>
              <button className="p-1.5 text-muted-foreground hover:text-primary rounded-md transition-colors">
                <UserPlus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* Publish CTA */}
      <div className="bg-card border border-border/40 rounded-lg p-5 space-y-3">
        <p className="text-sm font-semibold text-foreground">Built something cool?</p>
        <p className="text-xs text-muted-foreground">Share your project with the community and get real feedback.</p>
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
