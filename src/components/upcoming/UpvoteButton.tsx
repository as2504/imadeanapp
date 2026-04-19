import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  appId: string;
  initialCount: number;
  size?: "sm" | "lg";
  className?: string;
}

const UpvoteButton = ({ appId, initialCount, size = "sm", className }: UpvoteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (!user) { setVoted(false); return; }
    let cancelled = false;
    supabase.from("idea_upvotes").select("id").eq("app_id", appId).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) setVoted(!!data); });
    return () => { cancelled = true; };
  }, [appId, user?.id]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in to upvote", description: "Create an account to support ideas you love." });
      navigate("/auth");
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !voted;
    setVoted(next);
    setCount((c) => c + (next ? 1 : -1));
    if (next) {
      const { error } = await supabase.from("idea_upvotes").insert({ app_id: appId, user_id: user.id });
      if (error) { setVoted(false); setCount((c) => c - 1); toast({ title: "Couldn't upvote", description: error.message, variant: "destructive" }); }
    } else {
      const { error } = await supabase.from("idea_upvotes").delete().eq("app_id", appId).eq("user_id", user.id);
      if (error) { setVoted(true); setCount((c) => c + 1); toast({ title: "Couldn't remove vote", description: error.message, variant: "destructive" }); }
    }
    setBusy(false);
  };

  const isLg = size === "lg";

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border transition-all active:scale-95 shrink-0",
        isLg ? "w-16 h-20 gap-0.5" : "w-12 h-14 gap-0",
        voted
          ? "bg-primary/10 border-primary/40 text-primary"
          : "bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-border",
        className,
      )}
      aria-label={voted ? "Remove upvote" : "Upvote"}
    >
      <ChevronUp size={isLg ? 22 : 18} strokeWidth={2.5} />
      <span className={cn("font-bold tabular-nums", isLg ? "text-base" : "text-xs")}>{count}</span>
    </button>
  );
};

export default UpvoteButton;
