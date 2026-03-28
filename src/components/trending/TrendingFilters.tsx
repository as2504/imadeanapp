import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const timeFilters = ["Today", "This Week", "This Month", "All Time"];

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

  useEffect(() => {
    onFilterChange?.({ time: activeTime, category: "" });
  }, [activeTime]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {timeFilters.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTime(t)}
            className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTime === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {activeTime === t && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
          </button>
        ))}
      </div>

      {onOpenSidebar && (
        <button onClick={onOpenSidebar} className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors text-sm">
          More
        </button>
      )}
    </div>
  );
};

export default TrendingFilters;
