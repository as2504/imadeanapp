import { LayoutGrid, Heart, MessageSquare, Eye, Github, Twitter, Globe, ExternalLink, ArrowUpRight, CheckCircle2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const quickStats = [
  { icon: LayoutGrid, value: "12", label: "Apps Live", color: "text-primary bg-primary/5" },
  { icon: Heart, value: "2,342", label: "Total Likes", color: "text-rose-500 bg-rose-50" },
  { icon: MessageSquare, value: "89", label: "Comments", color: "text-sky-500 bg-sky-50" },
  { icon: Eye, value: "8.1K", label: "Page Views", color: "text-amber-500 bg-amber-50" },
];

const recentActivity = [
  { icon: "🚀", text: "Published Lumina OS v2.1 to the Public Gallery", time: "2 hours ago" },
  { icon: "⭐", text: "Earned Top Contributor badge for October", time: "Yesterday" },
  { icon: "💙", text: "Received 150 likes on Vibe-Check AI", time: "3 days ago" },
];

const socialLinks = [
  { icon: Github, label: "GitHub", handle: "julian-codes", url: "#" },
  { icon: Twitter, label: "Twitter", handle: "@jblack_vibe", url: "#" },
  { icon: Globe, label: "Website", handle: "julianblack.dev", url: "#" },
];

const completionItems = [
  { label: "Verified Email", done: true },
  { label: "Creator Bio Added", done: true },
  { label: "Connect GitHub Account", done: false },
];

const ProfileOverview = () => {
  const completionPercent = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
      {/* Main column */}
      <div className="space-y-10">
        {/* Performance Summary */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Performance Summary</h2>
            <button className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              View Analytics <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickStats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border/50 bg-background p-4 hover:shadow-sm transition-shadow"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-5">Recent Activity</h2>
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
            {recentActivity.map((item, i) => (
              <div key={i} className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 w-[18px] h-[18px] rounded-full bg-background border-2 border-border/60 flex items-center justify-center text-[10px]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Right sidebar */}
      <div className="space-y-6">
        {/* Profile Strength */}
        <div className="rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Profile Strength</h3>
            <span className="text-sm font-bold text-primary">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-1.5 mb-4" />
          <div className="space-y-2.5">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                {item.done ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Circle size={16} className="text-muted-foreground/40" />
                )}
                <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors">
            Complete Profile
          </button>
        </div>

        {/* Social Connections */}
        <div className="rounded-xl border border-border/50 p-5">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Social Connections
          </h3>
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                  <link.icon size={18} className="text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.handle}</p>
                </div>
                <ExternalLink size={14} className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div className="rounded-xl border border-border/50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Visibility
            </h3>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              Public
              <Eye size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
