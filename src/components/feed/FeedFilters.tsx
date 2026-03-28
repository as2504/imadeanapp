import { useState, useEffect } from "react";
import { ChevronDown, Globe, Smartphone, Filter, Code2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent, DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const feedTabs = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "trending", label: "Trending" },
];

const sortOptions = [
  { id: "recent", label: "Most Recent" },
  { id: "liked", label: "Most Liked" },
  { id: "viewed", label: "Most Viewed" },
];

const platforms = [
  { id: "all", label: "All Platforms", icon: <Globe size={14} /> },
  { id: "web", label: "Web Apps", icon: <Globe size={14} /> },
  { id: "ios", label: "iOS Apps", icon: <Smartphone size={14} /> },
  { id: "android", label: "Android Apps", icon: <Smartphone size={14} /> },
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
      {/* Feed tabs */}
      <div className="flex items-center gap-1">
        {feedTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveFeed(tab.id); setActiveSort(""); }}
            className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md ${
              activeFeed === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeFeed === tab.id && (
              <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md transition-colors">
              Sort <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px] p-1 rounded-lg border-border/40">
            {sortOptions.map((s) => (
              <DropdownMenuItem key={s.id} onClick={() => setActiveSort(s.id)} className={`rounded-md text-xs cursor-pointer ${activeSort === s.id ? "text-primary" : ""}`}>
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-md transition-colors">
              <Filter size={12} /> Filter <ChevronDown size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px] p-1 rounded-lg border-border/40">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">Platform</DropdownMenuLabel>
            {platforms.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => setActivePlatform(p.id)} className={`rounded-md text-xs cursor-pointer gap-2 ${activePlatform === p.id ? "text-primary" : ""}`}>
                {p.icon} {p.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">Tech Stack</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setActiveTech("")} className={`rounded-md text-xs cursor-pointer ${!activeTech ? "text-primary" : ""}`}>
              Any
            </DropdownMenuItem>
            {techStacks.map((t) => (
              <DropdownMenuItem key={t} onClick={() => setActiveTech(t)} className={`rounded-md text-xs cursor-pointer ${activeTech === t ? "text-primary" : ""}`}>
                {t}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setActivePlatform("all"); setActiveTech(""); }} className="rounded-md text-xs text-muted-foreground justify-center cursor-pointer">
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onOpenSidebar && (
          <button onClick={onOpenSidebar} className="lg:hidden p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors" aria-label="Open sidebar">
            <Filter size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedFilters;
