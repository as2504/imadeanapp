import { useState } from "react";
import { ChevronDown, ChevronLeft, Globe, Smartphone, Clock, Heart, Eye, Filter, Code2, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const feedTabs = [
  { id: "for-you", label: "For You", icon: <Heart size={14} className="text-rose-500" /> },
  { id: "following", label: "Following", icon: <Eye size={14} className="text-sky-500" /> },
  { id: "trending", label: "Trending", icon: <Layers size={14} className="text-amber-500" /> },
  { id: "recent", label: "Most Recent", icon: <Clock size={14} className="text-emerald-500" /> },
  { id: "liked", label: "Most Liked", icon: <Heart size={14} className="text-rose-500" /> },
  { id: "viewed", label: "Most Viewed", icon: <Eye size={14} className="text-sky-500" /> },
];

const platforms = [
  { id: "all", label: "All Platforms", icon: <Globe size={14} /> },
  { id: "web", label: "Web Apps", icon: <Globe size={14} /> },
  { id: "ios", label: "iOS Apps", icon: <Smartphone size={14} /> },
  { id: "android", label: "Android Apps", icon: <Smartphone size={14} /> },
];

const techStacks = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "supabase", label: "Supabase" },
  { id: "framer", label: "Framer Motion" },
];

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
  const [activeTab, setActiveTab] = useState(feedTabs[0]);
  const [activePlatform, setActivePlatform] = useState(platforms[0]);
  const [activeTech, setActiveTech] = useState("Any Stack");
  const [activeCategory, setActiveCategory] = useState("All");

  const getActiveStyles = (isActive: boolean) => 
    isActive 
      ? "text-primary bg-transparent font-bold focus:bg-transparent focus:text-primary" 
      : "font-medium focus:bg-transparent focus:text-primary";

  return (
    <div className="space-y-3">
      {/* Feed tab dropdowns + sidebar arrow */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Tab Selector (Unified) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-1 py-1.5 text-sm font-black text-foreground hover:text-primary transition-colors focus:outline-none shrink-0 uppercase tracking-widest">
                {activeTab.label}
                <ChevronDown size={14} className="text-muted-foreground/60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px] rounded-2xl p-2 border-border/40 shadow-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black px-3 py-2">
                Feed
              </DropdownMenuLabel>
              {feedTabs.slice(0, 3).map((tab) => (
                <DropdownMenuItem
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs uppercase tracking-wider ${getActiveStyles(activeTab.id === tab.id)}`}
                >
                  <span className={activeTab.id === tab.id ? "opacity-100" : "opacity-40"}>{tab.icon}</span>
                  {tab.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black px-3 py-2">
                Sort
              </DropdownMenuLabel>
              {feedTabs.slice(3).map((tab) => (
                <DropdownMenuItem
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs uppercase tracking-wider ${getActiveStyles(activeTab.id === tab.id)}`}
                >
                  <span className={activeTab.id === tab.id ? "opacity-100" : "opacity-40"}>{tab.icon}</span>
                  {tab.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-border/40 mx-1" />

          {/* Filter Dropdown (Nested) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-black text-muted-foreground hover:text-foreground transition-colors focus:outline-none shrink-0 uppercase tracking-widest">
                <Filter size={14} className="opacity-70" />
                <span>Filter</span>
                <ChevronDown size={14} className="text-muted-foreground/40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] rounded-2xl p-2 border-border/40 shadow-xl">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-black px-3 py-2">
                Refine Feed
              </DropdownMenuLabel>
              
              {/* Submenu: Platform */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl gap-3 py-2.5 px-3 text-xs uppercase tracking-wider font-bold">
                  <Globe size={14} className="opacity-70" />
                  <span>Platform</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="min-w-[180px] rounded-2xl p-2 border-border/40 shadow-2xl ml-1">
                    {platforms.map((p) => (
                      <DropdownMenuItem
                        key={p.id}
                        onClick={() => setActivePlatform(p)}
                        className={`rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs uppercase tracking-wider ${getActiveStyles(activePlatform.id === p.id)}`}
                      >
                        <span className={activePlatform.id === p.id ? "opacity-100" : "opacity-40"}>{p.icon}</span>
                        {p.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              {/* Submenu: Tech Stack */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="rounded-xl gap-3 py-2.5 px-3 text-xs uppercase tracking-wider font-bold">
                  <Code2 size={14} className="opacity-70" />
                  <span>Tech Stack</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="min-w-[180px] rounded-2xl p-2 border-border/40 shadow-2xl ml-1">
                    <DropdownMenuItem
                      onClick={() => setActiveTech("Any Stack")}
                      className={`rounded-xl py-2.5 px-3 cursor-pointer text-xs uppercase tracking-wider ${getActiveStyles(activeTech === "Any Stack")}`}
                    >
                      Any Stack
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2 opacity-50" />
                    {techStacks.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => setActiveTech(t.label)}
                        className={`rounded-xl py-2.5 px-3 cursor-pointer text-xs uppercase tracking-wider ${getActiveStyles(activeTech === t.label)}`}
                      >
                        {t.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator className="my-2 opacity-50" />
              <DropdownMenuItem 
                onClick={() => {
                  setActivePlatform(platforms[0]);
                  setActiveTech("Any Stack");
                }}
                className="rounded-xl text-[10px] text-muted-foreground hover:text-primary text-center justify-center font-black uppercase tracking-[0.2em] py-3"
              >
                Reset Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {categories.map((cat) => (
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

export default FeedFilters;
