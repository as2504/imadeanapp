import { useState, useEffect } from "react";
import { Share2, Bookmark } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AppDetailActionsProps {
  slug?: string;
  appId?: string;
}

const AppDetailActions = ({ slug, appId }: AppDetailActionsProps) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user || !appId) return;
    supabase.from("saved_apps" as any).select("id").eq("user_id", user.id).eq("app_id", appId).maybeSingle().then(({ data }) => {
      setSaved(!!data);
    });
  }, [user, appId]);

  const handleShare = () => {
    const url = slug ? `${window.location.origin}/app/${slug}` : window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "App link copied to clipboard." });
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save apps." });
      return;
    }
    if (!appId) return;
    if (saved) {
      await supabase.from("saved_apps" as any).delete().eq("user_id", user.id).eq("app_id", appId);
      setSaved(false);
      toast({ title: "Removed", description: "App removed from saved." });
    } else {
      await supabase.from("saved_apps" as any).insert({ user_id: user.id, app_id: appId } as any);
      setSaved(true);
      toast({ title: "Saved", description: "App saved to your profile." });
    }
  };

  return (
    <div className="flex items-center gap-2 py-5 border-b border-border/40">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors active:scale-[0.96]"
      >
        <Share2 size={16} />
        Share
      </button>
      <button
        onClick={handleSave}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors active:scale-[0.96] ${
          saved ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default AppDetailActions;
