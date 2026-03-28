import { Star, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AppDetailHeaderProps {
  app: { name: string; publisher: string; icon: string; views: number; publishedDate: string; platforms: string[]; slug?: string; };
  avgRating: number;
  totalRatings: number;
  onTryApp: () => void;
}

const AppDetailHeader = ({ app, avgRating, totalRatings, onTryApp }: AppDetailHeaderProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: app.name, text: `Check out ${app.name} on Showcase!`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast({ title: "Link Copied!", description: "App link copied to clipboard." });
      }
    } catch (err) { console.error("Error sharing:", err); }
  };

  return (
    <div className="flex items-start gap-5">
      <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden shrink-0">
        <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-semibold text-foreground">{app.name}</h1>
        <p className="text-sm text-primary mt-0.5">{app.publisher}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {avgRating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={12} className="fill-primary text-primary" />
              <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
              <span>({totalRatings})</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{app.views} views</span>
          </div>
          <span>{app.publishedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" onClick={onTryApp} className="h-9 px-5 rounded-lg text-sm font-medium">
          Try App
        </Button>
        <Button size="icon" variant="outline" onClick={handleShare} className="w-9 h-9 rounded-lg">
          <Share2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default AppDetailHeader;
