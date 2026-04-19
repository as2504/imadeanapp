import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedNavbar from "@/components/feed/FeedNavbar";
import PublicNavbar from "@/components/layout/PublicNavbar";
import SEO from "@/components/SEO";
import UpvoteButton from "@/components/upcoming/UpvoteButton";
import NotifyMeButton from "@/components/upcoming/NotifyMeButton";
import ConvertToPublishedBanner from "@/components/upcoming/ConvertToPublishedBanner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Calendar, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { getTimeAgo } from "@/lib/utils";

const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const isUrl = (s: string) => s.startsWith("http") || s.startsWith("/");

interface Comment {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  profile?: { display_name: string | null; username: string | null; avatar_url: string | null };
}

const UpcomingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [app, setApp] = useState<any>(null);
  const [publisher, setPublisher] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  const isOwner = user && app && user.id === app.user_id;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      let q = supabase.from("apps").select("*");
      q = isUUID(id) ? q.eq("id", id) : q.eq("slug", id);
      const { data } = await q.maybeSingle();
      if (!data || data.status !== "upcoming") { setApp(null); setLoading(false); return; }
      setApp(data);

      const [{ data: p }, { data: cmts }] = await Promise.all([
        supabase.from("profiles").select("display_name, username, avatar_url, is_verified").eq("user_id", data.user_id).maybeSingle(),
        supabase.from("comments").select("id, user_id, text, created_at").eq("app_id", data.id).order("created_at", { ascending: false }),
      ]);
      setPublisher(p);

      if (cmts && cmts.length > 0) {
        const cuids = [...new Set(cmts.map((c: any) => c.user_id))];
        const { data: cprofiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", cuids);
        const pmap = new Map((cprofiles || []).map((x) => [x.user_id, x]));
        setComments(cmts.map((c: any) => ({ ...c, profile: pmap.get(c.user_id) })));
      } else {
        setComments([]);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handlePostComment = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!newComment.trim() || !app) return;
    setPostingComment(true);
    const { data, error } = await supabase.from("comments").insert({ app_id: app.id, user_id: user.id, text: newComment.trim() }).select("id, user_id, text, created_at").maybeSingle();
    setPostingComment(false);
    if (error) { toast({ title: "Couldn't post", description: error.message, variant: "destructive" }); return; }
    const { data: prof } = await supabase.from("profiles").select("display_name, username, avatar_url").eq("user_id", user.id).maybeSingle();
    setComments((prev) => [{ ...(data as any), profile: prof || undefined }, ...prev]);
    setNewComment("");
  };

  const handleDeleteComment = async (cid: string) => {
    await supabase.from("comments").delete().eq("id", cid);
    setComments((prev) => prev.filter((c) => c.id !== cid));
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!app) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-foreground">Idea not found</h2>
      <Link to="/upcoming" className="text-primary text-sm hover:underline">Browse all ideas</Link>
    </div>
  );

  const publisherName = publisher?.display_name || publisher?.username || "Unknown";

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${app.app_name} (Upcoming) — imadeanapp`}
        description={(app.caption || app.full_description || "").slice(0, 160)}
        canonical={typeof window !== "undefined" ? window.location.href : undefined}
      />
      {user ? <FeedNavbar /> : <PublicNavbar />}

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="flex gap-4 sm:gap-5">
          <UpvoteButton appId={app.id} initialCount={app.upvotes_count || 0} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                {app.app_icon_url && isUrl(app.app_icon_url) ? (
                  <img src={app.app_icon_url} alt={app.app_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">💡</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{app.app_name}</h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Upcoming</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{app.caption || app.tagline}</p>
                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-2">
                  <Link to={`/profile/${app.user_id}`} className="font-semibold text-foreground hover:underline">@{publisherName}</Link>
                  <span>· {getTimeAgo(app.created_at)}</span>
                  {app.planned_launch && (
                    <span className="inline-flex items-center gap-1"><Calendar size={11} /> {app.planned_launch}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <NotifyMeButton appId={app.id} initialCount={app.notify_count || 0} ownerId={app.user_id} />
            </div>
          </div>
        </div>

        {/* Owner banner */}
        {isOwner && (
          <div className="mt-6">
            <ConvertToPublishedBanner appId={app.id} upvotes={app.upvotes_count || 0} notifyCount={app.notify_count || 0} />
          </div>
        )}

        {/* About */}
        <section className="mt-8 p-5 rounded-2xl border border-border/40 bg-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">About this idea</h2>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{app.full_description || "No description yet."}</p>
          {app.platforms?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Planned platforms:</span>
              {app.platforms.map((p: string) => (
                <span key={p} className="text-[11px] font-semibold px-2 py-0.5 bg-secondary rounded-full text-foreground capitalize">{p}</span>
              ))}
            </div>
          )}
        </section>

        {/* Comments */}
        <section className="mt-8">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <MessageSquare size={16} /> Discussion
            <span className="text-xs font-normal text-muted-foreground">({comments.length})</span>
          </h2>

          {user ? (
            <div className="space-y-2 mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share feedback, ask a question, or offer to help…"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-end">
                <Button size="sm" disabled={!newComment.trim() || postingComment} onClick={handlePostComment} className="rounded-xl">
                  {postingComment ? <Loader2 className="animate-spin" size={14} /> : "Post comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-xl border border-border/40 bg-card text-center">
              <p className="text-xs text-muted-foreground mb-2">Sign in to join the discussion</p>
              <Button size="sm" onClick={() => navigate("/auth")} className="rounded-xl">Sign in</Button>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No comments yet — be the first.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => {
                const initial = (c.profile?.display_name || c.profile?.username || "?").charAt(0).toUpperCase();
                return (
                  <div key={c.id} className="p-4 rounded-xl border border-border/40 bg-card">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                        {c.profile?.avatar_url ? <img src={c.profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold">{initial}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link to={`/profile/${c.user_id}`} className="text-xs font-semibold text-foreground hover:underline">
                            @{c.profile?.display_name || c.profile?.username || "user"}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{c.text}</p>
                        {user?.id === c.user_id && (
                          <button onClick={() => handleDeleteComment(c.id)} className="mt-2 text-[10px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                            <Trash2 size={10} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UpcomingDetail;
