import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, ArrowRight } from "lucide-react";

interface ThankYouScreenProps {
  appId: string;
  publisherId: string;
  publisherName: string;
  publisherAvatar?: string;
  isTestMode?: boolean;
  isOwner?: boolean;
}

const ThankYouScreen = ({ appId, publisherId, publisherName, publisherAvatar, isTestMode, isOwner }: ThankYouScreenProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (isTestMode || !user || loading) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", publisherId);
        setIsFollowing(false);
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: publisherId });
        setIsFollowing(true);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute -top-4 -left-4 w-3 h-3 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="absolute -top-2 right-0 w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
        <div className="absolute top-0 -right-6 w-4 h-4 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
        <div className="text-6xl mb-2">🎉</div>
      </div>

      <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Thank You!</h2>
      <p className="text-sm text-muted-foreground mb-10 text-center max-w-xs">
        Your feedback has been delivered to the developer.
      </p>

      <div className="bg-card border border-border/40 rounded-3xl p-6 w-full max-w-xs space-y-5 shadow-xl shadow-black/5">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-border/40">
            <AvatarImage src={publisherAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {publisherName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-foreground text-sm">{publisherName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Developer</p>
          </div>
        </div>

        <Button
          onClick={handleFollow}
          disabled={isTestMode || loading}
          className={`w-full rounded-2xl h-11 font-bold text-sm transition-all ${
            isFollowing
              ? "bg-secondary text-foreground hover:bg-secondary/80"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          }`}
        >
          <Heart size={16} className={isFollowing ? "fill-current mr-2" : "mr-2"} />
          {isFollowing ? "Following" : "Follow"}
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate(`/profile/${publisherId}`, { replace: true })}
          className="w-full rounded-2xl h-11 font-bold text-sm text-muted-foreground hover:text-foreground"
        >
          Go to Profile <ArrowRight size={14} className="ml-2" />
        </Button>

        {/* Only show "Return to Feedback Settings" for the app owner */}
        {isOwner && (
          <Button
            variant="ghost"
            onClick={() => navigate("/settings", { replace: true })}
            className="w-full rounded-2xl h-11 font-bold text-sm text-muted-foreground hover:text-foreground"
          >
            Return to Feedback Settings <ArrowRight size={14} className="ml-2" />
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => navigate(`/app/${appId}`, { replace: true })}
          className="w-full rounded-2xl h-11 font-bold text-sm text-muted-foreground hover:text-foreground"
        >
          Back to App <ArrowRight size={14} className="ml-2" />
        </Button>
      </div>

      {isTestMode && (
        <p className="mt-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          Test Mode — No data was saved
        </p>
      )}
    </div>
  );
};

export default ThankYouScreen;
