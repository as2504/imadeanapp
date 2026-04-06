import { useState, useEffect } from "react";
import { ChevronDown, Globe, Filter, Code2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const feedTabs = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
];

const sortOptions = [
  { id: "recent", label: "Most Recent" },
  { id: "rated", label: "Most Rated" },
  { id: "viewed", label: "Most Viewed" },
];

const PlatformIcon = ({ type, size = 14 }: { type: string; size?: number }) => {
  const iconMap: Record<string, string> = {
    web: "/webapp.png",
    ios: "/app-store.png",
    android: "/android.png",
  };
  if (!iconMap[type]) return <Globe size={size} />;
  return <img src={iconMap[type]} alt={type} className="dark:invert object-contain" style={{ width: size, height: size }} />;
};

const platforms = [
  { id: "all", label: "All Platforms", icon: <Globe size={14} /> },
  { id: "web", label: "Web Apps", icon: <PlatformIcon type="web" /> },
  { id: "ios", label: "iOS Apps", icon: <PlatformIcon type="ios" /> },
  { id: "android", label: "Android Apps", icon: <PlatformIcon type="android" /> },
];

const techStacks = ["React", "Next.js", "Tailwind CSS", "Supabase", "Framer Motion"];

export interface FeedFilterState {
  feed: string;
  sort: string;
  platform: string;
  techStack: string;
  category: string;
}

interface FeedFiltersProps {
  onOpenSidebar?: () => void;
  onFilterChange?: (filters: FeedFilterState) => void;
}

const FeedFilters = ({ onOpenSidebar, onFilterChange }: FeedFiltersProps) => {
  const [activeFeed, setActiveFeed] = useState("for-you");
  const [activeSort, setActiveSort] = useState("");
  const [activePlatform, setActivePlatform] = useState("all");
  const [activeTech, setActiveTech] = useState("");

  const isFilterActive = activePlatform !== "all" || activeTech !== "";

  const currentLabel = [...feedTabs, ...sortOptions].find(item => item.id === (activeSort || activeFeed))?.label || "For You";

  useEffect(() => {
    onFilterChange?.({
      feed: activeFeed,
      sort: activeSort,
      platform: activePlatform,
      techStack: activeTech,
      category: "",
    });
  }, [activeFeed, activeSort, activePlatform, activeTech]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {/* Selection Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-foreground hover:bg-secondary/60 rounded-md transition-colors outline-none">
              {currentLabel} <ChevronDown size={12} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px] p-1 rounded-xl border-border/40 bg-card shadow-xl">
            <DropdownMenuItem 
              onClick={() => { setActiveFeed("for-you"); setActiveSort(""); }} 
              className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", activeFeed === "for-you" && !activeSort && "text-primary bg-primary/5")}
            >
              For You
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { setActiveFeed("following"); setActiveSort(""); }} 
              className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", activeFeed === "following" && !activeSort && "text-primary bg-primary/5")}
            >
              Following
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            {sortOptions.map((s) => (
              <DropdownMenuItem 
                key={s.id} 
                onClick={() => { setActiveSort(s.id); }} 
                className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", activeSort === s.id && "text-primary bg-primary/5")}
              >
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-colors outline-none",
              isFilterActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            )}>
              <Filter size={12} /> Filter <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] p-1.5 rounded-xl border-border/40 bg-card shadow-xl">
            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground px-2.5 py-1.5">Platform</DropdownMenuLabel>
            {platforms.map((p) => (
              <DropdownMenuItem 
                key={p.id} 
                onClick={() => setActivePlatform(p.id)} 
                className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer gap-2 text-xs font-medium", activePlatform === p.id && "text-primary bg-primary/5")}
              >
                {p.icon} {p.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuLabel className="text-[9px] uppercase tracking-widest text-muted-foreground px-2.5 py-1.5">Tech Stack</DropdownMenuLabel>
            <DropdownMenuItem 
              onClick={() => setActiveTech("")} 
              className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", !activeTech && "text-primary bg-primary/5")}
            >
              Any
            </DropdownMenuItem>
            {techStacks.map((t) => (
              <DropdownMenuItem 
                key={t} 
                onClick={() => setActiveTech(t)} 
                className={cn("rounded-lg px-2.5 py-1.5 cursor-pointer text-xs font-medium", activeTech === t && "text-primary bg-primary/5")}
              >
                {t}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem 
              onClick={() => { setActivePlatform("all"); setActiveTech(""); setActiveSort(""); setActiveFeed("for-you"); }} 
              className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground justify-center cursor-pointer hover:text-destructive transition-colors uppercase tracking-tight"
            >
              Reset Filters
            </DropdownMenuItem>
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

export default FeedFilters;
