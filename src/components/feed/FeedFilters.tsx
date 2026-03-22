import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const feedTabs = ["For You", "Following", "Trending", "New"];
const categories = [
  "All",
  "Web Apps",
  "Mobile Apps",
  "AI Tools",
  "Productivity",
  "Design",
  "Dev Tools",
];

interface FeedFiltersProps {
  onOpenSidebar?: () => void;
}

const FeedFilters = ({ onOpenSidebar }: FeedFiltersProps) => {
  const [activeTab, setActiveTab] = useState("For You");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="space-y-3">
      {/* Feed tabs */}
      <div className="flex items-center border-b border-border/30 pb-1">
        <div className="flex items-center gap-1 flex-1">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 relative ${
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
        {onOpenSidebar && (
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 ${
              activeCategory === cat
                ? "bg-foreground text-background"
                : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeedFilters;
