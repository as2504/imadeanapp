import { useState } from "react";
import { Share2, Bookmark } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppDetailActionsProps {
  slug?: string;
}

const AppDetailActions = ({ slug }: AppDetailActionsProps) => {
  const [saved, setSaved] = useState(false);

  const handleShare = () => {
    const url = slug
      ? `${window.location.origin}/app/${slug}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied", description: "App link copied to clipboard." });
  };

  return (
    <div className="flex items-center gap-2 py-5 border-b border-border/40">
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
