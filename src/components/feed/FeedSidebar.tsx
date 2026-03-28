import { TrendingUp, UserPlus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="bg-card border border-border/40 rounded-[2rem] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
            Trending Tags
          </h3>
        </div>
        <div className="space-y-1">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl hover:bg-secondary hover:text-primary transition-all group"
            >
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                #{item.tag}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground/40 group-hover:text-primary/40">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested creators */}
      <div className="bg-card border border-border/40 rounded-[2rem] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={16} className="text-primary" />
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
            Creators to Follow
          </h3>
        </div>
        <div className="space-y-4">
          {suggestedCreators.map((creator) => (
            <div
              key={creator.handle}
              className="flex items-center gap-3 p-1"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-black text-primary uppercase">
                {creator.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {creator.name}
                </p>
                <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-tight">
                  {creator.apps} apps
                </p>
              </div>
              <button className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
                <UserPlus size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Publish CTA */}
      <div
        onClick={() => navigate("/publish")}
        className="bg-primary rounded-[2.5rem] p-8 text-center shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
          <Zap size={120} className="text-primary-foreground fill-primary-foreground" />
        </div>
        <div className="relative z-10">
          <p className="text-lg font-black text-primary-foreground mb-1">
            Built something cool?
          </p>
          <p className="text-[10px] font-black text-primary-foreground/60 mb-6 uppercase tracking-[0.2em]">
            Launch your app today
          </p>
          <Button 
            size="sm" 
            className="rounded-2xl text-[10px] font-black uppercase tracking-widest w-full bg-background text-foreground hover:bg-background/90 shadow-lg h-11"
          >
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedSidebar;
