import { Star, Eye, Info, Globe, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppDetailHeaderProps {
  app: {
    name: string;
    publisher: string;
    icon: string;
    rating: number;
    reviews: string;
    views: string;
    version: string;
    platforms: string[];
  };
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const AppDetailHeader = ({ app }: AppDetailHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
      {/* App Icon & Primary Info — Horizontal on Mobile */}
      <div className="flex items-center md:items-start gap-5 w-full md:w-auto">
        {/* App Icon — Squircle, smaller on mobile */}
        <div className="w-20 h-20 md:w-40 md:h-40 rounded-[2rem] bg-card border border-border/40 shadow-2xl shadow-black/5 flex items-center justify-center overflow-hidden shrink-0">
          <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
        </div>

        {/* Text Block — Side by side with icon on mobile */}
        <div className="flex-1 min-w-0 text-left">
          <h1 className="text-xl md:text-4xl font-black text-foreground tracking-tight leading-tight md:leading-[1.2] truncate">
            {app.name}
          </h1>
          <button className="text-primary text-xs md:text-sm font-bold hover:underline mt-1 block truncate">
            {app.publisher}
          </button>
          
          {/* Rating/Stats row — Compact on mobile */}
          <div className="flex items-center gap-2 md:gap-4 mt-3 text-[11px] md:text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-primary/20 text-primary md:w-4 md:h-4" />
              <span className="font-bold text-foreground">{app.rating}</span>
            </div>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1">
              <Eye size={14} className="md:w-4 md:h-4" />
              <span className="hidden sm:inline">{app.views} views</span>
              <span className="sm:hidden">{app.views}</span>
            </div>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1">
              <Info size={14} className="md:w-4 md:h-4" />
              <span>v{app.version}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions — Center aligned on mobile, Right aligned on desktop */}
      <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto md:ml-auto md:pt-2">
        <Button 
          size="lg" 
          className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-10 h-12 md:h-14 font-black text-sm md:text-base uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          Try App
        </Button>
        
        {/* Multi-platform Icons */}
        <div className="flex items-center justify-center gap-4 mt-1">
          {app.platforms.map((p) => {
            const config = platformConfig[p];
            if (!config) return null;
            return (
              <div 
                key={p} 
                className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
              >
                <img src={config.icon} className="w-4 h-4 md:w-5 md:h-5 object-contain dark:invert" alt={config.label} />
                <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase tracking-widest">
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppDetailHeader;
