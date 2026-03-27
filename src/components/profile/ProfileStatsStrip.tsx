import { LayoutGrid, Users, MessageSquare, Eye } from "lucide-react";

const quickStats = [
  { icon: LayoutGrid, value: "12", label: "Apps", color: "text-primary" },
  { icon: Users, value: "540", label: "Followers", color: "text-blue-500" },
  { icon: MessageSquare, value: "89", label: "Comments", color: "text-sky-500" },
  { icon: Eye, value: "8.1K", label: "Views", color: "text-amber-500" },
];

const ProfileStatsStrip = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-card border border-border/40 rounded-3xl shadow-sm">
      {quickStats.map((s) => (
        <div key={s.label} className="flex items-center gap-4 p-3 rounded-2xl bg-surface/30 border border-border/20 group hover:border-primary/20 transition-all">
          <div className={`p-2 rounded-xl bg-background group-hover:scale-110 transition-transform ${s.color}`}>
            <s.icon size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-foreground leading-none">{s.value}</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-[0.1em] font-black mt-1">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileStatsStrip;
