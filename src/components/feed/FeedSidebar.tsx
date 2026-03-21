import { TrendingUp, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const FeedSidebar = () => (
  <aside className="hidden lg:block w-72 shrink-0 space-y-6">
    {/* Trending tags */}
    <div className="bg-background border border-border/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-primary" />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Trending Tags
        </h3>
      </div>
      <div className="space-y-2">
        {trendingTags.map((item) => (
          <button
            key={item.tag}
            className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg hover:bg-surface transition-colors group"
          >
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              #{item.tag}
            </span>
            <span className="text-[11px] text-muted-foreground/60">
              {item.count} apps
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Suggested creators */}
    <div className="bg-background border border-border/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap size={14} className="text-primary" />
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Creators to Follow
        </h3>
      </div>
      <div className="space-y-3">
        {suggestedCreators.map((creator) => (
          <div
            key={creator.handle}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-muted-foreground">
              {creator.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {creator.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {creator.apps} apps
              </p>
            </div>
            <button className="p-1 text-primary hover:bg-primary/5 rounded-md transition-colors">
              <UserPlus size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Publish CTA */}
    <div className="bg-surface rounded-2xl p-5 text-center">
      <p className="text-sm font-semibold text-foreground mb-1">
        Built something cool?
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Share your app with the community
      </p>
      <Button size="sm" className="rounded-full text-xs w-full">
        Publish Your App
      </Button>
    </div>
  </aside>
);

export default FeedSidebar;
