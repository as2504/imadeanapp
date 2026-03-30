import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface DraftApp {
  id: string;
  app_name: string;
  app_icon_url: string | null;
  status: string;
  created_at: string;
  tagline: string | null;
  slug: string | null;
}

const ProfileDraftApps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apps, setApps] = useState<DraftApp[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrafts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("apps")
      .select("id, app_name, app_icon_url, status, created_at, tagline, slug")
      .eq("user_id", user.id)
      .in("status", ["draft", "unpublished"])
      .order("created_at", { ascending: false });
    if (!error && data) setApps(data);
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, [user]);

  const handlePublish = async (id: string) => {
    const { error } = await supabase.from("apps").update({ status: "published" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Published!", description: "Your app is now live." });
      fetchDrafts();
    }
  };

  if (loading) {
    return <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 px-6 border border-border/40 rounded-xl bg-card/50">
        <FileText size={40} className="mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No drafts</h3>
        <p className="text-sm text-muted-foreground">Unpublished apps and works in progress will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {apps.map((app) => (
        <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-card transition-colors">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
            {app.app_icon_url ? (
              <img src={app.app_icon_url} alt={app.app_name} className="w-full h-full object-cover" />
            ) : (
              <FileText size={18} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{app.app_name}</p>
            <p className="text-xs text-muted-foreground truncate">{app.tagline || "No tagline"}</p>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/40">
            {app.status}
          </span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/app/${app.slug || app.id}`)}>
              <Pencil size={14} />
            </Button>
            <Button variant="default" size="sm" className="h-8 text-xs" onClick={() => handlePublish(app.id)}>
              <Send size={12} className="mr-1" /> Publish
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileDraftApps;
