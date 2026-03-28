import { Star, Eye, Info, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppDetailHeaderProps {
  app: {
    name: string;
    publisher: string;
    icon: string;
    views: number;
    publishedDate: string;
    platforms: string[];
    slug?: string;
  };
  avgRating: number;
  totalRatings: number;
  onTryApp: () => void;
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const AppDetailHeader = ({ app, avgRating, totalRatings, onTryApp }: AppDetailHeaderProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: app.name,
          text: `Check out ${app.name} on Showcase!`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied!",
          description: "App link has been copied to your clipboard.",
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
      <div className="flex items-center md:items-start gap-4 w-full md:w-auto">
        <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-card border border-border/40 shadow-xl shadow-black/5 flex items-center justify-center overflow-hidden shrink-0">
          <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <h1 className="text-lg md:text-2xl font-black text-foreground tracking-tight leading-tight truncate">
            {app.name}
          </h1>
          <button className="text-primary text-[10px] md:text-xs font-bold hover:underline mt-0.5 block truncate">
            {app.publisher}
          </button>

          <div className="flex items-center gap-2 md:gap-3 mt-2 text-[10px] md:text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-primary/20 text-primary" />
              <span className="font-bold text-foreground">
                {avgRating > 0 ? avgRating.toFixed(1) : "—"}
              </span>
              {totalRatings > 0 && (
                <span className="text-muted-foreground/60">({totalRatings})</span>
              )}
            </div>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1">
              <Eye size={12} />
              <span>{app.views} views</span>
            </div>
            <span className="opacity-30">·</span>
            <div className="flex items-center gap-1">
              <span className="opacity-60">Published</span>
              <span>{app.publishedDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-2.5 w-full md:w-auto md:ml-auto">
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            size="sm"
            onClick={onTryApp}
            className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-10 md:h-11 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
          >
            Try App
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleShare}
            className="w-10 h-10 md:w-11 md:h-11 rounded-xl border-border/40 bg-card hover:bg-surface transition-all active:scale-95"
          >
            <Share2 size={16} className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppDetailHeader;
