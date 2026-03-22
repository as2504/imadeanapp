import { useState } from "react";
import { ChevronLeft } from "lucide-react";

const timeFilters = ["Today", "This Week", "This Month", "All Time"];
const categoryFilters = ["All", "Web Apps", "Mobile", "AI Tools", "Productivity", "Design", "Dev Tools"];

interface TrendingFiltersProps {
  onOpenSidebar?: () => void;
}

const TrendingFilters = ({ onOpenSidebar }: TrendingFiltersProps) => {
  const [activeTime, setActiveTime] = useState("This Week");
  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="space-y-3">
      {/* Time filters */}
      <div className="flex items-center border-b border-border/30 pb-1">
        <div className="flex items-center gap-1 flex-1">
          {timeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTime(t)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 relative ${
                activeTime === t
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {activeTime === t && (
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
        {categoryFilters.map((cat) => (
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

export default TrendingFilters;
