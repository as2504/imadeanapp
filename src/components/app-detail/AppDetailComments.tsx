import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  text: string;
  likes_count: number;
  created_at: string;
  user_id: string;
  display_name: string | null;
  initials: string;
}

const AppDetailComments = ({ appId }: { appId: string }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (!data) return;

      // Get profiles for comment authors
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, username")
        .in("user_id", userIds);

      const profileMap = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );

      setComments(
        data.map((c) => {
          const profile = profileMap.get(c.user_id);
          const name = profile?.display_name || profile?.username || "Anonymous";
          return {
            id: c.id,
            text: c.text,
            likes_count: c.likes_count || 0,
            created_at: c.created_at,
            user_id: c.user_id,
            display_name: name,
            initials: name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          };
        })
      );
    };

    fetchComments();
  }, [appId]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      app_id: appId,
      user_id: user.id,
      text: newComment.trim(),
    });
    if (error) {
      toast({ title: "Failed to post comment", variant: "destructive" });
    } else {
      const displayName = user.user_metadata?.display_name || user.email?.split("@")[0] || "You";
      setComments((prev) => [
        {
          id: crypto.randomUUID(),
          text: newComment.trim(),
          likes_count: 0,
          created_at: new Date().toISOString(),
          user_id: user.id,
          display_name: displayName,
          initials: displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
        },
        ...prev,
      ]);
      setNewComment("");
    }
    setSubmitting(false);
  };

  const getTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return `${Math.floor(diffDay / 7)}w ago`;
  };

  return (
    <section className="py-6 border-b border-border/40">
      <h2 className="text-sm font-semibold text-foreground mb-5">Community Feedback</h2>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
          You
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts…"
            className="flex-1 bg-surface rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-shadow"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button size="sm" className="rounded-full h-9 px-5 text-xs" disabled={!newComment.trim() || submitting} onClick={handleSubmit}>
            Post
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">{c.display_name}</span>
                <span className="text-muted-foreground/50">{getTimeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{c.text}</p>
              <button className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={12} />
                <span>{c.likes_count}</span>
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
};

export default AppDetailComments;
