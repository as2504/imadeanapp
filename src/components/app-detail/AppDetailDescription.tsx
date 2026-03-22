import { Globe, Smartphone, Monitor } from "lucide-react";

interface AppDetailDescriptionProps {
  description?: string | null;
  techStack?: string[] | null;
  platforms?: string[] | null;
  pricing?: string | null;
  githubUrl?: string | null;
}

const platformIcons: Record<string, React.ElementType> = {
  web: Globe,
  android: Smartphone,
  ios: Monitor,
};

const AppDetailDescription = ({ description, techStack, platforms, pricing, githubUrl }: AppDetailDescriptionProps) => {
  return (
    <section className="py-6 border-b border-border/40">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">About</h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line max-w-prose">
            {description || "No description provided."}
          </p>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          {techStack && techStack.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((t) => (
                  <span key={t} className="px-2.5 py-1 text-xs font-medium bg-surface text-foreground/70 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {platforms && platforms.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Platforms</h3>
              <div className="flex gap-3">
                {platforms.map((p) => {
                  const Icon = platformIcons[p] || Globe;
                  return (
                    <span key={p} className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <Icon size={14} />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {pricing && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pricing</h3>
              <span className="text-xs font-medium text-foreground/70 capitalize">{pricing}</span>
            </div>
          )}

          {githubUrl && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Source</h3>
              <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View on GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AppDetailDescription;
