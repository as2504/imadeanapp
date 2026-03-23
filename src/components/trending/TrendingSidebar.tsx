import { TrendingUp, Trophy, MessageCircle, Heart } from "lucide-react";

const topCreators = [
  { name: "Tomás Rivera", handle: "@tomas", apps: 5, trend: "+3 this week" },
  { name: "Marcus Wei", handle: "@marcus", apps: 8, trend: "+2 this week" },
  { name: "Isla Chen", handle: "@isla", apps: 3, trend: "New creator" },
];

const TrendingSidebar = () => {
  return (
    <div className="space-y-5">
      {/* Top Creators */}
      <div className="bg-background border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-amber-500" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Top Creators This Week
          </h3>
        </div>
        <div className="space-y-3">
          {topCreators.map((c, i) => (
            <div key={c.handle} className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted-foreground/40 tabular-nums w-4">
                {i + 1}
              </span>
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {c.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.trend}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Liked */}
      <div className="bg-background border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="text-red-400" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Most Liked
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl">🧘</span>
          <div>
            <p className="text-xs font-semibold text-foreground">FocusFlow</p>
            <p className="text-[10px] text-muted-foreground">312 likes this week</p>
          </div>
        </div>
      </div>

      {/* Most Discussed */}
      <div className="bg-background border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={14} className="text-blue-400" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Most Discussed
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl">🧘</span>
          <div>
            <p className="text-xs font-semibold text-foreground">FocusFlow</p>
            <p className="text-[10px] text-muted-foreground">58 comments</p>
          </div>
        </div>
      </div>

      {/* Trending Tags */}
      <div className="bg-background border border-border/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Trending Tags
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["AI", "Productivity", "No-Code", "Dev Tools", "Design", "Mobile"].map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-[11px] font-medium bg-surface text-muted-foreground rounded-full hover:bg-surface-hover transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
