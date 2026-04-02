import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Share2, Bookmark, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppDetailHeaderProps {
  app: { id?: string; name: string; publisher: string; publisherUserId?: string; icon: string; publishedDate: string; platforms: string[]; slug?: string; };
  avgRating: number;
  totalRatings: number;
  isAuthenticated?: boolean;
}

const AppDetailHeader = ({ app, avgRating, totalRatings, isAuthenticated = true }: AppDetailHeaderProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || !app.id) return;
    supabase.from("saved_apps" as any).select("id").eq("user_id", user.id).eq("app_id", app.id).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, app.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: app.name, text: `Check out ${app.name} on imadeanapp!`, url });
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

  const ActionButtons = ({ className }: { className?: string }) => (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button variant="ghost" size="icon" onClick={handleSave} className={`w-10 h-10 rounded-full hover:bg-secondary/80 ${saved ? "text-primary" : "text-muted-foreground"}`}>
        <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleShare} className="w-10 h-10 rounded-full text-muted-foreground hover:bg-secondary/80">
        <Share2 size={18} />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden shrink-0 border border-border/40">
          <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">{app.name}</h1>
              <button onClick={() => app.publisherUserId && navigate(`/profile/${app.publisherUserId}`)} className="text-sm sm:text-base text-primary font-medium mt-0.5 hover:underline cursor-pointer text-left">{app.publisher}</button>
            </div>
            
            {isAuthenticated && (
              <>
                <ActionButtons className="hidden sm:flex" />
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                        <MoreVertical size={20} className="text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleSave} className="gap-2">
                        <Bookmark size={16} fill={saved ? "currentColor" : "none"} className={saved ? "text-primary" : ""} />
                        {saved ? "Saved" : "Save"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleShare} className="gap-2">
                        <Share2 size={16} />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
        {avgRating > 0 && (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Star size={14} className="fill-primary text-primary" />
            <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground/60">({totalRatings})</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <Calendar size={14} />
          <span>{app.publishedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default AppDetailHeader;
