import { useState } from "react";
import { Heart, Share2, Bookmark } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppDetailActionsProps {
  likes: number;
}

const AppDetailActions = ({ likes }: AppDetailActionsProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "App link copied to clipboard." });
  };

  return (
    <div className="flex items-center gap-2 py-5 border-b border-border/40">
      <button
        onClick={toggleLike}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-[0.96] ${
          liked ? "text-red-500 bg-red-50" : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
      >
        <Heart size={16} fill={liked ? "currentColor" : "none"} />
        <span>{likeCount}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors active:scale-[0.96]"
      >
        <Share2 size={16} />
        Share
      </button>

      <button
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors active:scale-[0.96] ${
          saved ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
      >
        <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
};

export default AppDetailActions;
