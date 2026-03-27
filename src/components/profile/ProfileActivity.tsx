const activities = [
  { icon: "🚀", text: "Published Lumina OS v2.1", subtext: "to the Public Gallery", time: "2 hours ago", color: "bg-blue-500/10 text-blue-500" },
  { icon: "🏆", text: "Earned Top Contributor badge", subtext: "for October", time: "Yesterday", color: "bg-amber-500/10 text-amber-500" },
  { icon: "❤️", text: "Received 150 likes", subtext: "on Vibe-Check AI", time: "3 days ago", color: "bg-rose-500/10 text-rose-500" },
  { icon: "💬", text: 'Replied to a comment', subtext: '"Thanks, shipping v2 next week!" on TaskLoop', time: "4 days ago", color: "bg-sky-500/10 text-sky-500" },
  { icon: "👤", text: "Gained 12 new followers", subtext: "from the community", time: "1 week ago", color: "bg-indigo-500/10 text-indigo-500" },
  { icon: "🔧", text: "Updated ColorMind", subtext: "with dark mode support", time: "1 week ago", color: "bg-emerald-500/10 text-emerald-500" },
];

const ProfileActivity = () => {
  return (
    <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          Recent Activity
        </h3>
      </div>
      
      <div className="relative space-y-8">
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/20 via-border/40 to-transparent" />
        
        {activities.map((item, i) => (
          <div key={i} className="relative flex gap-6 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl z-10 shadow-sm border border-border/20 group-hover:scale-110 transition-all duration-300 shrink-0 ${item.color} bg-background`}>
              {item.icon}
            </div>
            
            <div className="flex-1 pt-1 pb-4 border-b border-border/20 group-last:border-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                  {item.text}
                </p>
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest bg-surface px-2 py-1 rounded-lg">
                  {item.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 font-medium leading-relaxed">
                {item.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-4 text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.3em] transition-all">
        View Full History
      </button>
    </div>
  );
};

export default ProfileActivity;
