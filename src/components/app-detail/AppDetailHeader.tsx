import { useState, useEffect } from "react";
import { Star, Eye, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AppDetailHeaderProps {
  app: { id?: string; name: string; publisher: string; icon: string; views: number; publishedDate: string; platforms: string[]; slug?: string; };
  avgRating: number;
  totalRatings: number;
  onTryApp: () => void;
}

const AppDetailHeader = ({ app, avgRating, totalRatings, onTryApp }: AppDetailHeaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || !app.id) return;
    supabase.from("saved_apps" as any).select("id").eq("user_id", user.id).eq("app_id", app.id).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, app.id]);

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

  const handleSave = async () => {
    if (!user) { toast({ title: "Sign in required", description: "Please sign in to save apps." }); return; }
    if (!app.id) return;
    if (saved) {
      await supabase.from("saved_apps" as any).delete().eq("user_id", user.id).eq("app_id", app.id);
      setSaved(false);
      toast({ title: "Removed", description: "App removed from saved." });
    } else {
      await supabase.from("saved_apps" as any).insert({ user_id: user.id, app_id: app.id } as any);
      setSaved(true);
      toast({ title: "Saved", description: "App saved to your profile." });
    }
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
        <Button size="icon" variant="outline" onClick={handleSave} className={`w-9 h-9 rounded-lg ${saved ? "text-primary border-primary/40" : ""}`}>
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
        </Button>
        <Button size="icon" variant="outline" onClick={handleShare} className="w-9 h-9 rounded-lg">
          <Share2 size={14} />
        </Button>
      </div>
    </div>
  );
};

export default AppDetailHeader;
