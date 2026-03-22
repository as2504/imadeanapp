import { Heart, MessageCircle, Eye } from "lucide-react";

interface AppDetailStatsProps {
  likes: number;
  comments: number;
  views: number;
  publishedAt: string;
}

const formatCount = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const AppDetailStats = ({ likes, comments, views, publishedAt }: AppDetailStatsProps) => {
  const daysAgo = Math.max(1, Math.floor((Date.now() - new Date(publishedAt).getTime()) / 86400000));
  const publishedLabel = daysAgo === 1 ? "Published today" : `Published ${daysAgo} days ago`;

  return (
    <div className="flex items-center gap-6 py-5 border-b border-border/40 text-sm text-muted-foreground flex-wrap">
      <span className="flex items-center gap-1.5">
        <Heart size={14} />
        <span className="font-medium text-foreground">{formatCount(likes)}</span> Likes
      </span>
      <span className="flex items-center gap-1.5">
        <MessageCircle size={14} />
        <span className="font-medium text-foreground">{formatCount(comments)}</span> Comments
      </span>
      <span className="flex items-center gap-1.5">
        <Eye size={14} />
        <span className="font-medium text-foreground">{formatCount(views)}</span> Views
      </span>
      <span className="text-muted-foreground/60">{publishedLabel}</span>
    </div>
  );
};

export default AppDetailStats;
