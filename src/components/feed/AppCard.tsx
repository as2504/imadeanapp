import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Star, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface AppPost {
  id: string;
  slug?: string;
  appName: string;
  appIcon: string;
  publisherName: string;
  publisherAvatar: string;
  verified: boolean;
  timeAgo: string;
  caption: string;
  tags: string[];
  platforms: ("web" | "android" | "ios")[];
  techStack?: string[];
  likes: number;
  comments: number;
  views: number;
  liked: boolean;
  saved: boolean;
  topComment?: string;
  status?: string;
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const isUrl = (str: string) => str.startsWith("http") || str.startsWith("/");

interface AppCardProps {
  post: AppPost;
  actions?: React.ReactNode;
}

const AppCard = ({ post, actions }: AppCardProps) => {
  const navigate = useNavigate();
  const [avgRating, setAvgRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      const { data } = await supabase.from("ratings").select("rating").eq("app_id", post.id);
      if (data && data.length > 0) {
        const avg = data.reduce((s, r) => s + r.rating, 0) / data.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    };
    fetchRating();
  }, [post.id]);

  return (
    <article
      onClick={() => navigate(`/app/${post.slug || post.id}`)}
      className="flex items-center gap-4 px-4 py-3 rounded-xl border-b border-border/10 last:border-b-0 hover:bg-secondary/40 transition-all cursor-pointer group"
    >
      {/* Icon */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
        {isUrl(post.appIcon) ? (
          <img src={post.appIcon} alt={post.appName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg">{post.appIcon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {post.appName}
          </h3>
          {post.verified && <CheckCircle2 size={12} className="text-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{post.caption}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted-foreground">{post.publisherName}</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-[11px] text-muted-foreground">{post.timeAgo}</span>
          <div className="flex items-center gap-1.5 ml-1">
            {post.platforms.map((p) => {
              const config = platformConfig[p];
              if (!config) return null;
              return <img key={p} src={config.icon} className="w-3.5 h-3.5 object-contain opacity-60 dark:invert" alt={config.label} />;
            })}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        {avgRating !== null && avgRating > 0 && (
          <div className="flex items-center gap-1">
            <Star size={12} className="text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">{avgRating.toFixed(1)}</span>
          </div>
        )}
        {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
        <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
      </div>
    </article>
  );
};

export default AppCard;
