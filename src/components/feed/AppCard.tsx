import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Globe,
  Smartphone,
  Monitor,
  Bookmark,
  Share2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const isUrl = (str: string) => str.startsWith("http") || str.startsWith("/");

const AppCard = ({ post }: { post: AppPost }) => {
  const navigate = useNavigate();

  return (
    <article className="bg-background border border-border/50 rounded-2xl p-5 hover:shadow-md transition-shadow duration-300 group">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0 overflow-hidden">
          {isUrl(post.appIcon) ? (
            <img src={post.appIcon} alt={post.appName} className="w-full h-full object-cover" />
          ) : (
            <span>{post.appIcon}</span>
          )}
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

        {/* Platform icons + 3-dot menu */}
        <div className="flex items-center gap-2 shrink-0">
          {post.platforms.map((p) => {
            const Icon = platformIcons[p];
            return (
              <div key={p} className="flex items-center text-muted-foreground/50">
                <Icon size={14} />
              </div>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-muted-foreground/40 hover:text-muted-foreground rounded-md transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Bookmark size={14} />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Share2 size={14} />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
        {post.caption}
      </p>

      {/* Divider */}
      <div className="mt-3 border-t border-border/30" />

      {/* Tags + Try */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <Button
          size="sm"
          className="rounded-full h-8 px-4 text-xs font-semibold gap-1.5 shrink-0"
          onClick={() => navigate(`/app/${post.id}`)}
        >
          <ExternalLink size={12} />
          Try
        </Button>
      </div>
    </article>
  );
};

export default AppCard;
