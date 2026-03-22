import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrendingApp } from "@/data/mockTrending";

const platformIcons = {
  web: Globe,
  android: Smartphone,
  ios: Monitor,
};

const TrendingCard = ({ app }: { app: TrendingApp }) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(app.liked);
  const [saved, setSaved] = useState(app.saved);
  const [likeCount, setLikeCount] = useState(app.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <article className="bg-background border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow duration-300 group">
      <div className="flex items-start gap-4">
        {/* Rank */}
        <div className="flex flex-col items-center shrink-0 pt-0.5">
          <span className="text-2xl font-bold text-muted-foreground/30 tabular-nums leading-none">
            {String(app.rank).padStart(2, "0")}
          </span>
          <ArrowUp size={14} className="text-emerald-500 mt-1" />
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
          <span>{app.appIcon}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {app.appName}
                </h3>
                {app.verified && (
                  <CheckCircle2 size={14} className="text-primary shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
                  {app.publisherAvatar}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {app.publisherName}
                </span>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground/60">
                  {app.timeAgo}
                </span>
              </div>
            </div>

            {/* Trend badge */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
              <TrendingUp size={11} />
              <span className="text-[10px] font-semibold whitespace-nowrap">
                {app.trendLabel}
              </span>
            </div>
          </div>

          {/* Caption */}
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed line-clamp-2">
            {app.caption}
          </p>

          {/* Tags + platforms */}
          <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {app.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              {app.platforms.map((p) => {
                const Icon = platformIcons[p];
                return (
                  <div key={p} className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <Icon size={12} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
                  liked
                    ? "text-red-500 bg-red-50"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <Heart size={15} fill={liked ? "currentColor" : "none"} />
                <span>{likeCount}</span>
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors active:scale-95">
                <MessageCircle size={15} />
                <span>{app.comments}</span>
              </button>
              <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface transition-colors active:scale-95">
                <Share2 size={15} />
              </button>
              <button
                onClick={() => setSaved(!saved)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors active:scale-95 ${
                  saved
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>
            <Button size="sm" className="rounded-full h-8 px-4 text-xs font-semibold gap-1.5" onClick={() => navigate(`/app/${app.id}`)}>
              <ExternalLink size={12} />
              Try
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default TrendingCard;
