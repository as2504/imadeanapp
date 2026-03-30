import { UserPlus, ArrowRight, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const topCreators = [
  { name: "Ananya Mehta", handle: "@ananya", apps: 12 },
  { name: "Leo Park", handle: "@leopark", apps: 8 },
  { name: "Sara Voss", handle: "@saravoss", apps: 5 },
];

const mostRated = [
  { name: "FocusFlow", rating: "4.9", count: "128" },
  { name: "Stackly", rating: "4.8", count: "95" },
];

const mostReviewed = [
  { name: "DevPort", comments: "58" },
  { name: "ShipDeck", comments: "42" },
];

const FeedSidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      {/* Top Creators */}
      <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Top Creators This Week
        </h3>
        <div className="space-y-3">
          {topCreators.map((creator, i) => (
            <div key={creator.handle} className="flex items-center gap-3 px-1">
              <span className="text-xs font-bold text-muted-foreground/40 tabular-nums w-4">
                {i + 1}
              </span>
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-semibold text-foreground shrink-0">
                {creator.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                <p className="text-[11px] text-muted-foreground">{creator.apps} projects</p>
              </div>
              <button className="p-1.5 text-muted-foreground hover:text-primary rounded-md transition-colors shrink-0">
                <UserPlus size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Most Rated */}
      <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Most Rated This Week
        </h3>
        <div className="space-y-3">
          {mostRated.map((app) => (
            <div key={app.name} className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                <Star size={14} className="text-primary fill-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                <p className="text-[11px] text-muted-foreground">{app.rating} ({app.count} ratings)</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Reviewed */}
      <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-1">
          Most Reviewed This Week
        </h3>
        <div className="space-y-3">
          {mostReviewed.map((app) => (
            <div key={app.name} className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <MessageSquare size={14} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                <p className="text-[11px] text-muted-foreground">{app.comments} reviews</p>
              </div>
            </div>
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

export default FeedSidebar;
