import {
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Globe,
  Smartphone,
  Monitor,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface LivePreviewProps {
  appName: string;
  tagline: string;
  caption: string;
  tags: string[];
  platforms: string[];
  techStack: string[];
  iconUrl: string | null;
}

const platformIcons: Record<string, React.ElementType> = {
  web: Globe,
  android: Smartphone,
  ios: Monitor,
};

const LivePreview = ({ appName, tagline, caption, tags, platforms, techStack, iconUrl }: LivePreviewProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "You";

  return (
    <div className="sticky top-24">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Feed Preview</p>

      <article className="bg-background border border-border/50 rounded-2xl p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface border border-border/60 flex items-center justify-center text-lg shrink-0 overflow-hidden">
            {iconUrl ? (
              <img src={iconUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground text-sm">📱</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {appName || "App Name"}
              </h3>
              <CheckCircle2 size={14} className="text-primary shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground/50">·</span>
              <span className="text-xs text-muted-foreground/60">Just now</span>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">
          {caption || tagline || "Your caption will appear here..."}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Platform + Tech */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {platforms.map((p) => {
              const Icon = platformIcons[p];
              if (!Icon) return null;
              return (
                <div key={p} className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                  <Icon size={12} />
                  <span className="capitalize">{p}</span>
                </div>
              );
            })}
          </div>
          {techStack.length > 0 && (
            <div className="flex items-center gap-1">
              {techStack.slice(0, 3).map((tech) => (
                <span key={tech} className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50 border border-border/40 rounded-md">
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
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              <Heart size={15} /> 0
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              <MessageCircle size={15} /> 0
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              <Share2 size={15} />
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground">
              <Bookmark size={15} />
            </span>
          </div>
          <Button size="sm" className="rounded-full h-8 px-4 text-xs font-semibold gap-1.5">
            <ExternalLink size={12} /> Try
          </Button>
        </div>
      </article>
    </div>
  );
};

export default LivePreview;
