import { Github, Twitter, ExternalLink, CheckCircle2, Circle, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { icon: Github, label: "GitHub", handle: "julian-codes", url: "#" },
  { icon: Twitter, label: "Twitter", handle: "@jblack_vibe", url: "#" },
];

const completionItems = [
  { label: "Verified Email", done: true },
  { label: "Creator Bio Added", done: true },
  { label: "Connect GitHub Account", done: false },
];

const ProfileSidebar = () => {
  const completionPercent = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  return (
    <div className="space-y-10">
      {/* Profile Strength — AT THE TOP */}
      <section className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-700">
          <Zap size={100} className="text-primary fill-primary" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Zap size={16} className="text-primary" />
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
              Profile Strength
            </h3>
          </div>
          
          <div className="flex items-end justify-between mb-4">
            <div className="space-y-1">
              <span className="text-4xl font-black text-foreground">{completionPercent}%</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Complete</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
              {completionItems.filter(i => i.done).length}/{completionItems.length}
            </div>
          </div>
          
          <Progress value={completionPercent} className="h-2 mb-6 bg-surface" />
          
          <div className="space-y-3">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface/50 transition-colors">
                <div className={`p-1 rounded-lg ${item.done ? "bg-emerald-500/10" : "bg-muted"}`}>
                  {item.done ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Circle size={14} className="text-muted-foreground/30" />
                  )}
                </div>
                <span className={`text-xs font-bold ${item.done ? "text-foreground" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-8 h-12 rounded-2xl bg-foreground text-background hover:bg-foreground/90 font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95">
            Complete Profile
          </Button>
        </div>
      </section>

      {/* Social Connections */}
      <section className="px-2">
        <div className="flex items-center gap-2 mb-6">
          <Github size={16} className="text-muted-foreground" />
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
            Connections
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-card border border-border/40 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-border/20 group-hover:scale-110 transition-transform">
                <link.icon size={20} className="text-foreground/70 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-foreground">{link.label}</p>
                <p className="text-[11px] font-bold text-muted-foreground mt-1 truncate uppercase tracking-tighter">{link.handle}</p>
              </div>
              <div className="p-2 rounded-lg bg-surface opacity-0 group-hover:opacity-100 transition-all">
                <ExternalLink size={14} className="text-primary" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileSidebar;
