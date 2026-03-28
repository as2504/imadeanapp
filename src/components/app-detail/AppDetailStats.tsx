import { Tag, Globe, Smartphone, Monitor, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDetailStatsProps {
  tags: string[];
  platforms: string[];
  pricing: string;
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const AppDetailStats = ({ tags, platforms, pricing }: AppDetailStatsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Pricing Chip */}
      <div className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm",
        pricing === "Free" 
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
            return <img key={p} src={config.icon} className="w-4 h-4 object-contain invert" alt={config.label} />;
          })}
        </div>
      </div>

      {/* Tags Group */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {tags.map(tag => (
          <div key={tag} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface border border-border/40 text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap hover:border-primary/20 hover:text-primary transition-all shadow-sm">
            <Tag size={12} className="shrink-0" />
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppDetailStats;
