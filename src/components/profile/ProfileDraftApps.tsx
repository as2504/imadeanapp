import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AppCard from "@/components/feed/AppCard";
import type { AppPost } from "@/components/feed/AppCard";
import {
  MoreVertical, Edit3, Eye, Trash2, Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

const ProfileDraftApps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apps, setApps] = useState<AppPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchDrafts = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("apps")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["draft", "unpublished"])
      .order("created_at", { ascending: false });

    if (!data) { setApps([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    const publisherName = profile?.display_name || profile?.username || "User";

    const mapped: AppPost[] = data.map((app) => ({
      id: app.id,
      slug: app.slug || undefined,
      appName: app.app_name,
      appIcon: app.app_icon_url || "📱",
      publisherName,
      publisherAvatar: publisherName.charAt(0),
      verified: true,
      timeAgo: getTimeAgo(app.created_at),
      caption: app.caption || app.tagline || "",
      tags: app.tags || [],
      platforms: (app.platforms || []) as ("web" | "android" | "ios")[],
      techStack: app.tech_stack || [],
      likes: app.likes_count || 0,
      comments: app.comments_count || 0,
      views: app.views_count || 0,
      liked: false,
      saved: false,
      status: app.status as any,
    }));

    setApps(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchDrafts(); }, [user]);

  const handlePublish = async (id: string) => {
    setIsActionLoading(true);
    const { error } = await supabase.from("apps").update({ status: "published" }).eq("id", id);
    setIsActionLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Published!", description: "Your app is now live." });
      fetchDrafts();
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE" || !deleteId) return;
    setIsActionLoading(true);
    const { error } = await supabase.from("apps").delete().eq("id", deleteId);
    setIsActionLoading(false);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "App deleted", description: "Your app has been removed forever." });
      setDeleteId(null);
      setDeleteConfirm("");
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
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="relative group/card">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <AppCard post={app} onClick={(e) => {}} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
                <DropdownMenuItem
                  onClick={() => navigate(`/app/${app.slug || app.id}`)}
                  className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider"
                >
                  <Eye size={14} className="text-sky-500" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/publish?edit=${app.id}`)}
                  className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider"
                >
                  <Edit3 size={14} className="text-amber-500" /> Edit App
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePublish(app.id)}
                  className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-emerald-500"
                >
                  <Send size={14} /> Publish
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2 opacity-50" />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteId(app.id)}
                  className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-destructive focus:text-destructive"
                >
                  <Trash2 size={14} /> Delete App
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="absolute top-2 left-2 z-10">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/90 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm">
                Draft
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-border/40 p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2">
              This action cannot be undone. This will permanently delete your application.
              <div className="mt-6 p-4 bg-destructive/5 rounded-2xl border border-destructive/10">
                <p className="text-xs font-black text-destructive uppercase tracking-widest mb-3">Type "DELETE" to confirm</p>
                <Input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="h-12 bg-background border-destructive/20 focus:border-destructive rounded-xl font-black text-center tracking-[0.5em]"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest border-border/40">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleteConfirm !== "DELETE" || isActionLoading}
              className="rounded-xl h-12 px-8 font-black uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {isActionLoading ? <Loader2 className="animate-spin" /> : "Delete Forever"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}

export default ProfileDraftApps;
