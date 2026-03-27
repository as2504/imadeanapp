import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppDetailCommentsProps {
  appId: string;
  userTried: boolean;
}

interface CommentItem {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  displayName: string;
  avatar: string;
  rating?: number;
}

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
    // Fetch comments with profiles
    const { data: rawComments } = await supabase
      .from("comments")
      .select("*")
      .eq("app_id", appId)
      .order("created_at", { ascending: false });

    if (rawComments && rawComments.length > 0) {
      const userIds = [...new Set(rawComments.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      setComments(
        rawComments.map((c) => {
          const p = profileMap.get(c.user_id);
          const name = p?.display_name || p?.username || "Anonymous";
          return {
            id: c.id,
            user_id: c.user_id,
            text: c.text,
            created_at: c.created_at,
            displayName: name,
            avatar: name.substring(0, 2).toUpperCase(),
          };
        })
      );
    } else {
      setComments([]);
    }

    // Fetch ratings
    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating, user_id")
      .eq("app_id", appId);

    const ratingsArr = ratings || [];
    if (ratingsArr.length > 0) {
      const avg = ratingsArr.reduce((s, r) => s + r.rating, 0) / ratingsArr.length;
      setAvgRating(Math.round(avg * 10) / 10);
    } else {
      setAvgRating(0);
    }
    setTotalRatings(ratingsArr.length);

    // Check user's existing rating
    if (user) {
      const userRating = ratingsArr.find((r) => r.user_id === user.id);
      if (userRating) {
        setExistingRating(userRating.rating);
        setRating(userRating.rating);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [appId, user]);

  const handleSubmit = async () => {
    if (rating === 0 || !user) return;

    // Upsert rating
    if (existingRating !== null) {
      await supabase
        .from("ratings")
        .update({ rating, review_text: comment || null })
        .eq("app_id", appId)
        .eq("user_id", user.id);
    } else {
      await supabase.from("ratings").insert({
        app_id: appId,
        user_id: user.id,
        rating,
        review_text: comment || null,
      });
    }

    // Insert comment if provided
    if (comment.trim()) {
      await supabase.from("comments").insert({
        app_id: appId,
        user_id: user.id,
        text: comment.trim(),
      });
    }

    setSubmitted(true);
    setComment("");
    setExistingRating(rating);
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
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  };

  return (
    <div className="space-y-12">
      {/* Rating Summary */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-[0.1em]">
          Ratings & Reviews
        </h2>

        {/* Average rating display */}
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <span className="text-5xl font-black text-foreground leading-none">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </span>
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mt-1">
              {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={20}
                className={cn(
                  s <= Math.round(avgRating)
                    ? "fill-primary text-primary"
                    : "fill-muted text-muted-foreground/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Rating input */}
        <div
          className={cn(
            "p-8 rounded-[2rem] border border-border/40 bg-card transition-all",
            !userTried ? "opacity-40 grayscale pointer-events-none" : "shadow-xl"
          )}
        >
          {!userTried && (
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
              Try the app to leave a review
            </p>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform active:scale-90"
                >
                  <Star
                    size={28}
                    className={cn(
                      "transition-colors",
                      s <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted-foreground/20"
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm font-bold text-foreground ml-2">{rating}/5</span>
              )}
            </div>

            <div className="relative">
              <Textarea
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] rounded-2xl border-border/40 bg-surface focus:bg-background transition-all p-5 placeholder:text-muted-foreground/30 font-medium"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                  {existingRating ? "Update your review" : "Leave a review"}
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={rating === 0 || !user}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-11 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {existingRating ? "Update" : "Submit"} <Send size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {submitted && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500 z-[100]">
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">
                <CheckCircle2 size={16} /> Review submitted successfully
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Comments List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </span>
        </div>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-10">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border/20 flex items-center justify-center text-sm font-black text-primary shrink-0 uppercase tracking-tighter shadow-sm">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                      {c.displayName}
                    </h4>
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest bg-surface px-2 py-1 rounded-lg">
                      {getTimeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-medium">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AppDetailComments;
