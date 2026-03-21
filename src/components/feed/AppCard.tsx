import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  MoreHorizontal,
  Globe,
  Smartphone,
  Monitor,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AppPost {
  id: string;
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
}

const platformIcons = {
  web: Globe,
  android: Smartphone,
  ios: Monitor,
};

const AppCard = ({ post }: { post: AppPost }) => {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const [likeCount, setLikeCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  return (
    <article className="bg-background border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow duration-300 group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0 overflow-hidden">
          <span>{post.appIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {post.appName}
            </h3>
            {post.verified && (
              <CheckCircle2 size={14} className="text-primary shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
              {post.publisherAvatar}
            </div>
            <span className="text-xs text-muted-foreground truncate">
              {post.publisherName}
            </span>
            <span className="text-xs text-muted-foreground/50">·</span>
            <span className="text-xs text-muted-foreground/60">
              {post.timeAgo}
            </span>
          </div>
        </div>
        <button className="p-1 text-muted-foreground/40 hover:text-muted-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Caption */}
      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
        {post.caption}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-full hover:bg-surface-hover transition-colors cursor-pointer"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Platform + Tech */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.platforms.map((p) => {
            const Icon = platformIcons[p];
            return (
              <div
                key={p}
                className="flex items-center gap-1 text-[11px] text-muted-foreground/60"
              >
                <Icon size={12} />
                <span className="capitalize">{p}</span>
              </div>
            );
          })}
        </div>
        {post.techStack && post.techStack.length > 0 && (
          <div className="flex items-center gap-1">
            {post.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50 border border-border/40 rounded-md"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-border/30" />

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
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
            <span>{post.comments}</span>
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

        <Button
          size="sm"
          className="rounded-full h-8 px-4 text-xs font-semibold gap-1.5"
        >
          <ExternalLink size={12} />
          Try
        </Button>
      </div>

      {/* Comment preview */}
      {post.topComment && (
        <div className="mt-3 px-3 py-2 bg-surface/50 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {post.topComment}
          </p>
        </div>
      )}
    </article>
  );
};

export default AppCard;
