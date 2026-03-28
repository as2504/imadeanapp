import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppDetailCommentsProps { appId: string; userTried: boolean; }
interface CommentItem { id: string; user_id: string; text: string; created_at: string; displayName: string; avatar: string; }

const AppDetailComments = ({ appId, userTried }: AppDetailCommentsProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  const fetchData = async () => {
    const { data: rawComments } = await supabase.from("comments").select("*").eq("app_id", appId).order("created_at", { ascending: false });
    if (rawComments && rawComments.length > 0) {
      const userIds = [...new Set(rawComments.map((c) => c.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      setComments(rawComments.map((c) => {
        const p = profileMap.get(c.user_id);
        const name = p?.display_name || p?.username || "Anonymous";
        return { id: c.id, user_id: c.user_id, text: c.text, created_at: c.created_at, displayName: name, avatar: name.substring(0, 2).toUpperCase() };
      }));
    } else { setComments([]); }

    const { data: ratings } = await supabase.from("ratings").select("rating, user_id").eq("app_id", appId);
    const ratingsArr = ratings || [];
    setAvgRating(ratingsArr.length > 0 ? Math.round((ratingsArr.reduce((s, r) => s + r.rating, 0) / ratingsArr.length) * 10) / 10 : 0);
    setTotalRatings(ratingsArr.length);
    if (user) {
      const userRating = ratingsArr.find((r) => r.user_id === user.id);
      if (userRating) { setExistingRating(userRating.rating); setRating(userRating.rating); }
    }
  };

  useEffect(() => { fetchData(); }, [appId, user]);

  const handleSubmit = async () => {
    if (rating === 0 || !user) return;
    if (existingRating !== null) {
      await supabase.from("ratings").update({ rating, review_text: comment || null }).eq("app_id", appId).eq("user_id", user.id);
    } else {
      await supabase.from("ratings").insert({ app_id: appId, user_id: user.id, rating, review_text: comment || null });
    }
    if (comment.trim()) await supabase.from("comments").insert({ app_id: appId, user_id: user.id, text: comment.trim() });
    setSubmitted(true); setComment(""); setExistingRating(rating);
    setTimeout(() => setSubmitted(false), 3000);
    fetchData();
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-8">
      {/* Rating summary */}
      <div className="flex items-center gap-6">
        <div>
          <span className="text-4xl font-bold text-foreground">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
          <p className="text-xs text-muted-foreground mt-1">{totalRatings} {totalRatings === 1 ? "rating" : "ratings"}</p>
        </div>
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={16} className={cn(s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
          ))}
        </div>
      </div>

      {/* Rating input */}
      <div className={cn("p-6 rounded-lg border border-border/40 bg-card", !userTried && "opacity-40 pointer-events-none")}>
        {!userTried && <p className="text-xs text-muted-foreground mb-4">Try the app first to leave a review</p>}
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="transition-transform active:scale-90">
                <Star size={24} className={cn("transition-colors", s <= (hoverRating || rating) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
              </button>
            ))}
            {rating > 0 && <span className="text-sm text-foreground ml-2">{rating}/5</span>}
          </div>
          <Textarea placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[80px] bg-background border-border/40" />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={rating === 0 || !user} size="sm" className="gap-2">
              {existingRating ? "Update" : "Submit"} <Send size={12} />
            </Button>
          </div>
        </div>
        {submitted && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--success))] text-white rounded-lg text-sm font-medium shadow-lg">
              <CheckCircle2 size={14} /> Review submitted
            </div>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">{comments.length} {comments.length === 1 ? "comment" : "comments"}</p>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">{c.displayName}</h4>
                    <span className="text-[11px] text-muted-foreground">{getTimeAgo(c.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppDetailComments;
