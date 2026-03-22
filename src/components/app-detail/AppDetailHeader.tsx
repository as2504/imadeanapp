import { ArrowLeft, Globe, Smartphone, Monitor, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AppDetailHeaderProps {
  app: {
    app_name: string;
    tagline?: string | null;
    app_icon_url?: string | null;
    tags?: string[] | null;
    platforms?: string[] | null;
    website_url?: string | null;
    play_store_url?: string | null;
    app_store_url?: string | null;
    created_at: string;
  };
  publisherName: string;
  publisherUserId: string;
}

const platformConfig: Record<string, { icon: React.ElementType; label: string; urlKey: string }> = {
  web: { icon: Globe, label: "Web", urlKey: "website_url" },
  android: { icon: Smartphone, label: "Android", urlKey: "play_store_url" },
  ios: { icon: Monitor, label: "iOS", urlKey: "app_store_url" },
};

const AppDetailHeader = ({ app, publisherName }: AppDetailHeaderProps) => {
  const navigate = useNavigate();

  const timeAgo = (() => {
    const diff = Date.now() - new Date(app.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  })();

  const primaryUrl = app.website_url || app.play_store_url || app.app_store_url;

  return (
    <section className="py-8 border-b border-border/40">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors active:scale-[0.97]"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="flex flex-col sm:flex-row gap-6 sm:items-start sm:justify-between">
        {/* Left: identity */}
        <div className="flex gap-5 items-start">
          <div className="w-20 h-20 rounded-2xl bg-surface flex items-center justify-center text-3xl shrink-0 overflow-hidden shadow-sm">
            {app.app_icon_url ? (
              <img src={app.app_icon_url} alt={app.app_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground/40">📦</span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground leading-tight">{app.app_name}</h1>
              <CheckCircle2 size={18} className="text-primary shrink-0" />
            </div>
            {app.tagline && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">{app.tagline}</p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">by {publisherName}</span>
              <span>·</span>
              <span>{timeAgo}</span>
            </div>
            {app.tags && app.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {app.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-0.5 text-[11px] font-medium bg-surface text-muted-foreground rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
          {primaryUrl && (
            <Button
              size="lg"
              className="gap-2"
              onClick={() => window.open(primaryUrl, "_blank")}
            >
              <ExternalLink size={16} />
              Try App
            </Button>
          )}
          <div className="flex items-center gap-3">
            {(app.platforms || []).map((p) => {
              const config = platformConfig[p];
              if (!config) return null;
              const Icon = config.icon;
              const url = (app as Record<string, unknown>)[config.urlKey] as string | undefined;
              return (
                <button
                  key={p}
                  onClick={() => url && window.open(url, "_blank")}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon size={14} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDetailHeader;
