const recentActivity = [
  { icon: "🚀", text: "Published Lumina OS v2.1", subtext: "to the Public Gallery", time: "2 hours ago" },
  { icon: "🏆", text: "Earned Top Contributor badge", subtext: "for October", time: "Yesterday" },
  { icon: "❤️", text: "Received 150 likes", subtext: "on Vibe-Check AI", time: "3 days ago" },
];

const ProfileOverview = () => {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">
          Recent Activity
        </h3>
        <div className="relative pl-8 space-y-8">
          <div className="absolute left-[11px] top-1 bottom-1 w-[1px] bg-border/40" />
          {recentActivity.map((item, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-8 top-0.5 w-[23px] h-[23px] rounded-full bg-background border border-border/60 flex items-center justify-center text-[11px] z-10 shadow-sm group-hover:border-primary/30 transition-colors text-foreground">
                {item.icon}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-foreground leading-none">{item.text}</p>
                  <span className="text-[11px] text-muted-foreground/60">{item.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{item.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProfileOverview;
