import { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NotifyMeButtonProps {
  appId: string;
  initialCount: number;
  ownerId?: string;
  variant?: "compact" | "full";
}

const NotifyMeButton = ({ appId, initialCount, ownerId, variant = "full" }: NotifyMeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [count, setCount] = useState(initialCount);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (!user) { setSubscribed(false); return; }
    let cancelled = false;
    supabase.from("idea_notify_subscriptions").select("id").eq("app_id", appId).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) setSubscribed(!!data); });
    return () => { cancelled = true; };
  }, [appId, user?.id]);

  const isOwner = user && ownerId && user.id === ownerId;

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in to get notified", description: "We'll ping you the moment this idea launches." });
      navigate("/auth");
      return;
    }
    if (isOwner) {
      toast({ title: "That's your idea", description: "You'll know the moment it goes live :)" });
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !subscribed;
    setSubscribed(next);
    setCount((c) => c + (next ? 1 : -1));
    if (next) {
      const { error } = await supabase.from("idea_notify_subscriptions").insert({ app_id: appId, user_id: user.id });
      if (error) { setSubscribed(false); setCount((c) => c - 1); toast({ title: "Couldn't subscribe", description: error.message, variant: "destructive" }); }
      else toast({ title: "You're on the list 🔔", description: "We'll notify you when this app launches." });
    } else {
      const { error } = await supabase.from("idea_notify_subscriptions").delete().eq("app_id", appId).eq("user_id", user.id);
      if (error) { setSubscribed(true); setCount((c) => c + 1); toast({ title: "Couldn't unsubscribe", description: error.message, variant: "destructive" }); }
    }
    setBusy(false);
  };

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors",
          subscribed ? "bg-primary/10 text-primary" : "bg-secondary/60 text-muted-foreground hover:text-foreground",
        )}
      >
        {subscribed ? <BellRing size={12} /> : <Bell size={12} />}
        <span className="tabular-nums">{count}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]",
        subscribed
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-secondary text-foreground hover:bg-secondary/70 border border-border/40",
      )}
    >
      {subscribed ? <BellRing size={16} /> : <Bell size={16} />}
      {subscribed ? "Notifying you" : "Notify me"}
      <span className="text-xs text-muted-foreground tabular-nums">· {count}</span>
    </button>
  );
};

export default NotifyMeButton;
