import { useState, useEffect } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const timeFilters = ["Today", "This Week", "This Month", "All Time"];
const categoryFilters = ["All", "Web Apps", "Mobile", "AI Tools", "Productivity", "Design", "Dev Tools"];

export interface TrendingFilterState {
  time: string;
  category: string;
}

interface TrendingFiltersProps {
  onOpenSidebar?: () => void;
  onFilterChange?: (filters: TrendingFilterState) => void;
}

const TrendingFilters = ({ onOpenSidebar, onFilterChange }: TrendingFiltersProps) => {
  const [activeTime, setActiveTime] = useState("This Week");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (!onFilterChange) return;
    onFilterChange({
      time: activeTime,
      category: activeCategory === "All" ? "" : activeCategory,
    });
  }, [activeTime, activeCategory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-1 py-1.5 text-sm font-black text-foreground hover:text-primary transition-colors focus:outline-none uppercase tracking-widest">
              {activeTime}
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px] rounded-2xl p-2 border-border/40 shadow-xl">
            {timeFilters.map((t) => (
              <DropdownMenuItem
                key={t}
                onClick={() => setActiveTime(t)}
                className={`rounded-xl py-2.5 px-4 cursor-pointer font-bold text-xs uppercase tracking-wider ${
                  activeTime === t
                    ? "text-primary bg-transparent focus:bg-transparent focus:text-primary"
                    : "text-muted-foreground focus:text-primary focus:bg-transparent"
                }`}
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

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {categoryFilters.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 text-[11px] font-black rounded-xl whitespace-nowrap transition-all duration-300 active:scale-90 border border-border/40 uppercase tracking-widest ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "bg-surface text-muted-foreground hover:bg-surface-hover hover:text-foreground hover:border-border"
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
