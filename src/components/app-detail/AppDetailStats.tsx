import { useState, useEffect, useRef } from "react";
import { Tag, ShieldCheck, Zap, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppDetailStatsProps {
  tags: string[];
  platforms: string[];
  pricing: string;
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/webapp.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const AppDetailStats = ({ tags, platforms, pricing }: AppDetailStatsProps) => {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tagsRef.current;
    if (el) {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 2);
    }
  }, [tags]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-wrap items-center gap-3">
        {/* Pricing Chip */}
        <div className={cn(
          "flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
          pricing?.toLowerCase() === "free" 
            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" 
            : "bg-primary/5 text-primary border-primary/20"
        )}>
          <ShieldCheck size={14} className="shrink-0" />
          {pricing}
        </div>

        {/* Platforms Group */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-surface border border-border/40 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm">
          <Zap size={14} className="text-primary shrink-0" />
          <div className="flex items-center gap-3">
            {platforms.map(p => {
              const config = platformConfig[p];
              if (!config) return null;
              return (
                <Tooltip key={p} open={openTooltip === p} onOpenChange={(open) => { if (open) setOpenTooltip(p); else if (openTooltip === p) setOpenTooltip(null); }}>
                  <TooltipTrigger asChild>
                    <img 
                      src={config.icon} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenTooltip(openTooltip === p ? null : p);
                      }}
                      className="w-4 h-4 object-contain dark:invert cursor-pointer hover:scale-110 transition-transform" 
                      alt={config.label} 
                    />
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover/90 backdrop-blur-md border-border/40 p-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-0.5">Available in</p>
                    <p className="text-[11px] font-medium text-muted-foreground">{config.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tags Group */}
      {tags.length > 0 && (
        <div className="mt-3">
          <div
            ref={tagsRef}
            className={cn(
              "flex flex-wrap items-center gap-2 transition-all",
              !showAllTags && "max-h-[36px] overflow-hidden"
            )}
          >
            {tags.map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface border border-border/40 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap hover:border-primary/20 hover:text-primary transition-all shadow-sm">
                <Tag size={12} className="shrink-0" />
                {tag}
              </div>
            ))}
          </div>
          {(isOverflowing || showAllTags) && (
            <button
              onClick={() => setShowAllTags(!showAllTags)}
              className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
            >
              {showAllTags ? "See less" : "See more"}
              <ChevronDown size={12} className={cn("transition-transform", showAllTags && "rotate-180")} />
            </button>
          )}
        </div>
      )}
    </TooltipProvider>
  );
};

export default AppDetailStats;
