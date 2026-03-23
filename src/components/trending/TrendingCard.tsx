import { useNavigate } from "react-router-dom";
import {
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  ArrowUp,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TrendingApp } from "@/data/mockTrending";

const platformIcons = {
  web: Globe,
  android: Smartphone,
  ios: Monitor,
};

const isUrl = (str: string) => str.startsWith("http") || str.startsWith("/");

const TrendingCard = ({ app }: { app: TrendingApp }) => {
  const navigate = useNavigate();

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
        <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0 overflow-hidden">
          {isUrl(app.appIcon) ? (
            <img src={app.appIcon} alt={app.appName} className="w-full h-full object-cover" />
          ) : (
            <span>{app.appIcon}</span>
          )}
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

            {/* Trend badge + platforms + menu */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                <TrendingUp size={11} />
                <span className="text-[10px] font-semibold whitespace-nowrap">
                  {app.trendLabel}
                </span>
              </div>
              {app.platforms.map((p) => {
                const Icon = platformIcons[p];
                return (
                  <div key={p} className="text-muted-foreground/50">
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
          <p className="mt-2 text-sm text-foreground/80 leading-relaxed line-clamp-2">
            {app.caption}
          </p>

          {/* Divider */}
          <div className="mt-2.5 border-t border-border/30" />

          {/* Tags + Try */}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {app.tags.slice(0, 3).map((tag) => (
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
              onClick={() => navigate(`/app/${app.id}`)}
            >
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
