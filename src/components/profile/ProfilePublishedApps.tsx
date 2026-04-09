import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppCard from "@/components/feed/AppCard";
import { 
  Edit3, Eye, Trash2, PowerOff, 
  AlertCircle, Loader2, X
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { AppPost } from "@/components/feed/AppCard";

interface ProfilePublishedAppsProps {
  profileUserId?: string;
}

const ProfilePublishedApps = ({ profileUserId }: ProfilePublishedAppsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [unpublishId, setUnpublishId] = useState<string | null>(null);
  const [unpublishReason, setUnpublishReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Click-to-open options tray
  const [openTrayId, setOpenTrayId] = useState<string | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  // Prevent scroll-triggered taps on mobile
  const touchStartY = useRef<number | null>(null);

  const targetUserId = profileUserId || user?.id;
  const isOwnProfile = !profileUserId || profileUserId === user?.id;

  const fetchApps = async () => {
    if (!targetUserId) return;
    setLoading(true);
    let query = supabase
      .from("apps")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false });

    // Only show published apps (filter out draft/unpublished)
    query = query.eq("status", "published");

    const { data } = await query;
    if (!data) { setApps([]); setLoading(false); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username, avatar_url")
      .eq("user_id", targetUserId)
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
      status: app.status as any
    }));

    setApps(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchApps(); }, [targetUserId, isOwnProfile]);

  // Close tray when clicking outside
  useEffect(() => {
    if (!openTrayId) return;
    const handler = (e: MouseEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setOpenTrayId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openTrayId]);

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE" || !deleteId) return;
    setIsActionLoading(true);
    const { error } = await supabase.from("apps").delete().eq("id", deleteId);
    setIsActionLoading(false);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "App deleted", description: "Your app has been removed forever." });
      setDeleteId(null); setDeleteConfirm(""); fetchApps();
    }
  };

  const handleUnpublish = async () => {
    if (!unpublishId || !unpublishReason.trim()) return;
    setIsActionLoading(true);
    const { error } = await supabase
      .from("apps")
      .update({ status: "draft", unpublish_reason: unpublishReason } as any)
      .eq("id", unpublishId);
    setIsActionLoading(false);
    if (error) {
      toast({ title: "Operation failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Moved to Drafts", description: "Your app has been unpublished and moved to your Drafts." });
      setUnpublishId(null); setUnpublishReason(""); setOpenTrayId(null); fetchApps();
    }
  };

  const handleCardClick = (appId: string, slug?: string) => {
    if (isOwnProfile && user) {
      // Toggle options tray instead of navigating
      setOpenTrayId((prev) => (prev === appId ? null : appId));
    } else {
      navigate(`/app/${slug || appId}`);
    }
  };

  if (loading) {
    return <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-card border border-border/40 rounded-[2rem] shadow-sm">
        <p className="text-6xl mb-6">🚀</p>
        <h3 className="text-2xl font-black text-foreground mb-2 uppercase tracking-tight">
          {isOwnProfile ? "Time to launch?" : "No apps yet"}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
          {isOwnProfile
            ? "You haven't published anything yet. Share your first vibe-coded app with the world today."
            : "This creator hasn't published any apps yet."}
        </p>
        {isOwnProfile && (
          <Button size="lg" className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-95" onClick={() => navigate("/publish")}>
            Publish Your First App
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {apps.map((app) => (
          <div key={app.id} className="relative">
            <div
              onTouchStart={(e) => { touchStartY.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                if (touchStartY.current !== null) {
                  const delta = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
                  if (delta > 10) { touchStartY.current = null; return; } // was a scroll
                }
                touchStartY.current = null;
                handleCardClick(app.id, app.slug);
              }}
              onClick={(e) => {
                // Only handle on non-touch devices
                if ('ontouchstart' in window) return;
                e.preventDefault();
                handleCardClick(app.id, app.slug);
              }}
            >
              <AppCard post={app} onClick={(e) => e.preventDefault()} />
            </div>

            {/* Options tray */}
            {isOwnProfile && openTrayId === app.id && (
              <div
                ref={trayRef}
                className="absolute top-full left-0 right-0 z-30 mt-1 bg-card border border-border/40 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                <button
                  onClick={() => setOpenTrayId(null)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X size={12} />
                </button>
                <button
                  onClick={() => { setOpenTrayId(null); navigate(`/app/${app.slug || app.id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Eye size={14} className="text-sky-500" /> App Details
                </button>
                <button
                  onClick={() => { setOpenTrayId(null); navigate(`/publish?edit=${app.id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <Edit3 size={14} className="text-amber-500" /> Update App
                </button>
                <div className="h-px bg-border/30 my-1" />
                <button
                  onClick={() => { setOpenTrayId(null); setUnpublishId(app.id); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <PowerOff size={14} /> Unpublish App
                </button>
                <button
                  onClick={() => { setOpenTrayId(null); setDeleteId(app.id); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} /> Delete App
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-border/40 p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2">
              This action cannot be undone. This will permanently delete your application and all its associated data from our servers.
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

      {/* Unpublish Confirmation */}
      <AlertDialog open={!!unpublishId} onOpenChange={(open) => !open && setUnpublishId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-border/40 p-8 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Unpublish Application</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2">
              Your app will be hidden from the Home and Trending feeds and moved to your Drafts. You can republish it at any time.
              <div className="mt-6 space-y-2">
                <LabelEl className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Reason for unpublishing</LabelEl>
                <Input 
                  value={unpublishReason}
                  onChange={(e) => setUnpublishReason(e.target.value)}
                  placeholder="e.g. Maintenance, Re-branding..."
                  className="h-12 bg-background border-border/40 focus:border-primary rounded-xl font-bold"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest border-border/40">Keep Published</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleUnpublish(); }}
              disabled={!unpublishReason.trim() || isActionLoading}
              className="rounded-xl h-12 px-8 font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20"
            >
              {isActionLoading ? <Loader2 className="animate-spin" /> : "Confirm Unpublish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const LabelEl = ({ children, className }: any) => (
  <h3 className={className}>{children}</h3>
);

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

export default ProfilePublishedApps;
