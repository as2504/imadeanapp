import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const timeFilters = [
  { id: "Today", label: "Today" },
  { id: "This Week", label: "This Week" },
  { id: "This Month", label: "This Month" },
  { id: "All Time", label: "All Time" },
];

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

  const currentLabel = timeFilters.find(f => f.id === activeTime)?.label || "This Week";

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-secondary/60 rounded-md transition-colors outline-none">
              {currentLabel} <ChevronDown size={12} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px] p-1 rounded-xl border-border/40 bg-card shadow-xl">
            {timeFilters.map((t) => (
              <DropdownMenuItem 
                key={t.id} 
                onClick={() => setActiveTime(t.id)} 
                className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", activeTime === t.id && "text-primary bg-primary/5")}
              >
                {t.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {onOpenSidebar && (
        <button 
          onClick={onOpenSidebar} 
          className="lg:hidden p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors text-[10px] font-black uppercase tracking-widest"
        >
          More
        </button>
      )}
    </div>
  );
};

export default TrendingFilters;
