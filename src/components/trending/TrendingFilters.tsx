import { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      {/* Time filter dropdown + sidebar arrow */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-1 py-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors focus:outline-none">
              {activeTime}
              <ChevronDown size={15} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {timeFilters.map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => setActiveTime(t)}
                className={activeTime === t ? "bg-accent font-medium" : ""}
              >
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
