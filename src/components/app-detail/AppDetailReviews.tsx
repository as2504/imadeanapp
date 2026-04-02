import { useState, useEffect, useCallback } from "react";
import { Star, Send, CheckCircle2, ThumbsUp, MessageSquare, Info, AlertCircle, Pencil, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppDetailReviewsProps { appId: string; userTried: boolean; }
interface ReviewItem { 
  id: string; 
  user_id: string; 
  text: string; 
  created_at: string; 
  displayName: string; 
  avatar: string; 
  likes_count: number;
  hasLiked: boolean;
}

const AppDetailReviews = ({ appId, userTried }: AppDetailReviewsProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [allReviews, setAllReviews] = useState<ReviewItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);
  const [existingRating, setExistingRating] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editComment, setEditComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const PAGE_SIZE = 10;
  const MAX_CHARS = 200;

  const isOverLimit = comment.length > MAX_CHARS;
  const isEditOverLimit = editComment.length > MAX_CHARS;

  const enrichReviews = useCallback(async (rawComments: any[]): Promise<ReviewItem[]> => {
    const userIds = [...new Set(rawComments.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, username, avatar_url")
      .in("user_id", userIds);
    
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

    // Fetch user's likes for these comments
    let userLikes = new Set<string>();
    if (user) {
      const commentIds = rawComments.map((c) => c.id);
      const { data: likes } = await supabase
        .from("comment_likes" as any)
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", commentIds);
      if (likes) {
        userLikes = new Set((likes as any[]).map((l) => l.comment_id));
      }
    }
    
    return rawComments.map((c) => {
      const p = profileMap.get(c.user_id);
      const name = p?.display_name || p?.username || "Anonymous";
      return { 
        id: c.id, 
        user_id: c.user_id, 
        text: c.text, 
        created_at: c.created_at, 
        displayName: name, 
        avatar: name.substring(0, 2).toUpperCase(),
        likes_count: c.likes_count || 0,
        hasLiked: userLikes.has(c.id),
      };
    });
  }, [user]);

  const fetchRecentReviews = useCallback(async () => {
    const { data: rawComments } = await supabase
      .from("comments")
      .select("*")
      .eq("app_id", appId)
      .order("created_at", { ascending: false })
      .limit(3);

    if (rawComments && rawComments.length > 0) {
      const enriched = await enrichReviews(rawComments);
      setReviews(enriched);
    } else {
      setReviews([]);
    }
  }, [appId, enrichReviews]);

  const fetchData = useCallback(async () => {
    const { data: ratings } = await supabase.from("ratings").select("rating, user_id").eq("app_id", appId);
    const ratingsArr = ratings || [];
    setAvgRating(ratingsArr.length > 0 ? Math.round((ratingsArr.reduce((s, r) => s + r.rating, 0) / ratingsArr.length) * 10) / 10 : 0);
    setTotalRatings(ratingsArr.length);
    
    const { count } = await supabase
      .from("comments")
      .select("*", { count: 'exact', head: true })
      .eq("app_id", appId);
    setTotalReviewsCount(count || 0);

    if (user) {
      const userRating = ratingsArr.find((r) => r.user_id === user.id);
      if (userRating) { 
        setExistingRating(userRating.rating); 
        setRating(userRating.rating); 
      }
    }

    await fetchRecentReviews();
  }, [appId, user, fetchRecentReviews]);

  const fetchMoreReviews = useCallback(async (reset = false) => {
    const newPage = reset ? 0 : page + 1;
    const { data: rawComments } = await supabase
      .from("comments")
      .select("*")
      .eq("app_id", appId)
      .order("created_at", { ascending: false })
      .range(newPage * PAGE_SIZE, (newPage + 1) * PAGE_SIZE - 1);

    if (rawComments && rawComments.length > 0) {
      const enriched = await enrichReviews(rawComments);
      if (reset) {
        setAllReviews(enriched);
      } else {
        setAllReviews(prev => [...prev, ...enriched]);
      }
      setPage(newPage);
      setHasMore(rawComments.length === PAGE_SIZE);
    } else {
      if (reset) setAllReviews([]);
      setHasMore(false);
    }
  }, [appId, page, enrichReviews]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!user || isOverLimit || (rating === 0 && !comment.trim())) return;
    setIsSubmitting(true);
    
    try {
      if (rating > 0) {
        if (existingRating !== null) {
          await supabase.from("ratings").update({ rating, review_text: comment || null }).eq("app_id", appId).eq("user_id", user.id);
        } else {
          await supabase.from("ratings").insert({ app_id: appId, user_id: user.id, rating, review_text: comment || null });
        }
        setExistingRating(rating);
      }
      
      if (comment.trim()) {
        await supabase.from("comments").insert({ 
          app_id: appId, 
          user_id: user.id, 
          text: comment.trim(),
          likes_count: 0
        });
      }
      
      setSubmitted(true); 
      setComment(""); 
      setTimeout(() => setSubmitted(false), 3000);
      await fetchData();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEdit = async () => {
    if (!user || isEditOverLimit || !editingCommentId) return;
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from("comments")
        .update({ text: editComment.trim() })
        .eq("id", editingCommentId);

      if (error) throw error;
      
      setIsEditModalOpen(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      
      await fetchData();
      if (isDialogOpen) {
        await fetchMoreReviews(true);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditModal = (review: ReviewItem) => {
    setEditComment(review.text);
    setEditingCommentId(review.id);
    setIsEditModalOpen(true);
  };

  const handleLike = async (reviewId: string) => {
    if (!user) return;

    const review = [...reviews, ...allReviews].find(r => r.id === reviewId);
    if (!review) return;

    if (review.hasLiked) {
      // Unlike: remove from comment_likes, decrement
      const updateLikes = (list: ReviewItem[]) => list.map(r => r.id === reviewId ? { ...r, likes_count: Math.max(0, r.likes_count - 1), hasLiked: false } : r);
      setReviews(updateLikes(reviews));
      setAllReviews(updateLikes(allReviews));
      await supabase.from("comment_likes" as any).delete().eq("comment_id", reviewId).eq("user_id", user.id);
      await supabase.from("comments").update({ likes_count: Math.max(0, (review.likes_count || 0) - 1) } as any).eq("id", reviewId);
    } else {
      // Like: insert into comment_likes, increment
      const updateLikes = (list: ReviewItem[]) => list.map(r => r.id === reviewId ? { ...r, likes_count: (r.likes_count || 0) + 1, hasLiked: true } : r);
      setReviews(updateLikes(reviews));
      setAllReviews(updateLikes(allReviews));
      await supabase.from("comment_likes" as any).insert({ comment_id: reviewId, user_id: user.id });
      await supabase.from("comments").update({ likes_count: (review.likes_count || 0) + 1 } as any).eq("id", reviewId);
    }
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

  const ReviewCard = ({ review }: { review: ReviewItem }) => (
    <div key={review.id} className="flex gap-3 p-3 rounded-xl bg-surface border border-border/40 transition-all hover:border-primary/20">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 border border-primary/10">
        {review.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-[13px] font-bold text-foreground truncate tracking-tight leading-none">{review.displayName}</h4>
            {user?.id === review.user_id && (
              <button 
                onClick={() => openEditModal(review)}
                className="p-1 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Pencil size={10} />
              </button>
            )}
          </div>
          <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">{getTimeAgo(review.created_at)}</span>
        </div>
        <p className="text-[13px] text-muted-foreground leading-snug mb-2 whitespace-pre-wrap">{review.text}</p>
        <button 
          onClick={() => handleLike(review.id)}
          className={cn(
            "flex items-center gap-1 text-[10px] font-bold transition-all px-2 py-1 rounded-md border border-transparent",
            review.hasLiked ? "text-primary bg-primary/5" : "text-muted-foreground/60 hover:text-primary hover:bg-primary/5 hover:border-primary/20"
          )}
        >
          <ThumbsUp size={10} className={cn(review.hasLiked && "fill-current")} />
          <span>{review.likes_count}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border/40 bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">Update Review</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your written feedback for this application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <Textarea 
                placeholder="Update your thoughts..." 
                value={editComment} 
                onChange={(e) => setEditComment(e.target.value)} 
                className={cn("min-h-[120px] bg-background/50 border-border/40 rounded-2xl p-4 text-sm focus:ring-primary/20", isEditOverLimit && "border-destructive focus:ring-destructive/20")} 
              />
              <div className={cn("text-[9px] font-bold uppercase tracking-widest mt-2 text-right", isEditOverLimit ? "text-destructive" : "text-muted-foreground/40")}>
                {editComment.length}/{MAX_CHARS} characters
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="ghost" disabled={isUpdating} onClick={() => setIsEditModalOpen(false)} className="rounded-full px-6 font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
            <Button onClick={handleUpdateEdit} disabled={isEditOverLimit || !editComment.trim() || isUpdating} className="rounded-full px-8 bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 min-w-[100px]">
              {isUpdating ? <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Community Feedback Summary */}
      <div className="flex items-center gap-4 py-3 px-5 rounded-2xl bg-surface border border-border/40">
        <div className="flex items-center gap-2 pr-4 border-r border-border/40">
          <span className="text-3xl font-black text-foreground tracking-tighter leading-none">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={10} className={cn(s <= Math.round(avgRating) ? "fill-primary text-primary" : "text-muted-foreground/20")} />
              ))}
            </div>
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest leading-none mt-1">{totalRatings} Ratings</span>
          </div>
        </div>
        <div className="flex items-center justify-between flex-1">
          <h3 className="text-xs font-black text-foreground uppercase tracking-tight leading-[1.1] tracking-[-0.02em]">Community Feedback</h3>
          <TooltipProvider><Tooltip><TooltipTrigger asChild><button className="text-muted-foreground/40 hover:text-primary transition-colors"><Info size={14} /></button></TooltipTrigger><TooltipContent className="max-w-[200px]"><p className="text-[10px] leading-tight">Ratings are based on user experiences. Only verified users who have tried the app can leave a review.</p></TooltipContent></Tooltip></TooltipProvider>
        </div>
      </div>

      {/* Your Review Card */}
      <div id="review-input" className={cn("p-5 rounded-2xl border border-border/40 bg-surface relative overflow-hidden", !userTried && "opacity-50 grayscale-[0.5]")}>
        {!userTried && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/40 backdrop-blur-[1px] cursor-not-allowed group">
            <div className="bg-background/90 px-3 py-1.5 rounded-full border border-border/40 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-[9px] font-bold text-foreground uppercase tracking-wider">Please try the app first to rate</p>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-foreground uppercase leading-[1.1] tracking-[-0.02em]">Your Review</h3>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} className="transition-transform active:scale-90 p-0.5">
                  <Star size={20} className={cn("transition-all duration-200", s <= (hoverRating || rating) ? "fill-primary text-primary scale-110" : "text-muted-foreground/20")} />
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative">
              <Textarea 
                placeholder="Tell others what you think..." 
                value={comment} 
                onChange={(e) => setComment(e.target.value)} 
                className={cn(
                  "min-h-[84px] bg-background/50 border-border/40 rounded-xl p-3 pr-10 text-[13px] focus:ring-primary/20 leading-tight", 
                  isOverLimit && "border-destructive focus:ring-destructive/20"
                )} 
              />
              <button 
                onClick={handleSubmit} 
                disabled={(!comment.trim() && rating === 0) || !user || isOverLimit || isSubmitting} 
                className={cn(
                  "absolute bottom-2.5 right-2.5 p-1.5 transition-all duration-200",
                  (!comment.trim() && rating === 0) || !user || isOverLimit || isSubmitting
                    ? "text-muted-foreground/20 cursor-not-allowed"
                    : "text-primary hover:scale-110 active:scale-90"
                )}
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-1.5">{isOverLimit && <div className="flex items-center gap-1 text-[10px] font-bold text-destructive uppercase tracking-tight animate-in fade-in slide-in-from-left-2"><AlertCircle size={10} /><span>Max {MAX_CHARS} characters reached</span></div>}</div>
              <div className={cn("text-[9px] font-bold uppercase tracking-widest", isOverLimit ? "text-destructive" : "text-muted-foreground/40")}>{comment.length}/{MAX_CHARS} characters</div>
            </div>
          </div>
        </div>
        {submitted && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold shadow-2xl uppercase tracking-widest"><CheckCircle2 size={14} /> Review Processed</div></div>}
      </div>

      {/* Recent Reviews Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between px-1"><h3 className="text-xs font-black text-foreground uppercase leading-[1.1] tracking-[-0.02em] flex items-center gap-1.5">Recent Reviews<span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/20 leading-none">{totalReviewsCount}</span></h3></div>
        {reviews.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border/60 bg-surface/30"><MessageSquare size={24} className="mx-auto text-muted-foreground/10 mb-2" /><p className="text-[11px] font-medium text-muted-foreground/40">Be the first to share your thoughts!</p></div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
            {totalReviewsCount > 3 && (
              <div className="pt-2 text-center">
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (open) { setPage(0); fetchMoreReviews(true); } }}>
                  <DialogTrigger asChild><button className="text-[10px] font-black text-primary hover:underline uppercase tracking-[0.15em]">Show all {totalReviewsCount} reviews</button></DialogTrigger>
                  <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-border/40">
                    <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                      <DialogTitle className="text-xl font-black uppercase tracking-tight">All Reviews</DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Browse the complete community feedback history for this application.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0"><ScrollArea className="h-full px-6 pb-6"><div className="space-y-3 pr-4">{allReviews.map((r) => <ReviewCard key={r.id} review={r} />)}{hasMore ? (<div className="pt-4 pb-2 text-center"><Button variant="outline" onClick={() => fetchMoreReviews()} className="rounded-full px-6 border-border/60 font-bold uppercase tracking-widest text-[9px] h-8 hover:bg-secondary">Load More</Button></div>) : allReviews.length > 0 ? (<p className="text-center py-6 text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">End of list</p>) : null}</div></ScrollArea></div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppDetailReviews;
