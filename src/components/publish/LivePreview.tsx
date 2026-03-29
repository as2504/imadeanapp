import { Star, CheckCircle2 } from "lucide-react";

interface LivePreviewProps {
  appName: string;
  caption: string;
  iconPreview: string | null;
  platforms: string[];
}

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web", icon: "/world-wide-web.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const LivePreview = ({ appName, caption, iconPreview, platforms }: LivePreviewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Live Feed Preview</span>
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary/5">
          <div className="px-4 py-3 flex items-center gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border/20 shadow-inner">
              {iconPreview ? (
                <img src={iconPreview} alt="Icon Preview" className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-500" />
              ) : (
                <span className="text-xl opacity-20">📱</span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {appName || "Your App Name"}
                </h3>
                <CheckCircle2 size={12} className="text-primary shrink-0 opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {caption || "Your catchy one-sentence caption goes here..."}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-muted-foreground/60 font-medium italic">You</span>
                <span className="text-muted-foreground/30">·</span>
                <span className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tighter">Just now</span>
                <div className="flex items-center gap-1.5 ml-1">
                   {platforms.map((p) => (
                    <img key={p} src={platformConfig[p]?.icon} className="w-3.5 h-3.5 object-contain opacity-40 dark:invert" alt="" />
                   ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 opacity-40">
              <Star size={12} className="text-primary fill-primary" />
              <span className="text-xs font-medium text-foreground">5.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-primary italic">Pro Tip</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          High-quality icons and clear, benefit-driven captions significantly increase click-through rates. Keep your caption under 60 characters for maximum impact.
        </p>
      </div>
    </div>
  );
};

export default LivePreview;
