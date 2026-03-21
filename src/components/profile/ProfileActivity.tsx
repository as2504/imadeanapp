const activities = [
  { icon: "🚀", text: "Published Lumina OS v2.1 to the Public Gallery", time: "2 hours ago", type: "publish" },
  { icon: "⭐", text: "Earned Top Contributor badge for October", time: "Yesterday", type: "badge" },
  { icon: "💙", text: "Received 150 likes on Vibe-Check AI", time: "3 days ago", type: "like" },
  { icon: "💬", text: 'Replied to a comment on TaskLoop: "Thanks, shipping v2 next week!"', time: "4 days ago", type: "comment" },
  { icon: "👤", text: "Gained 12 new followers", time: "1 week ago", type: "follow" },
  { icon: "🔧", text: "Updated ColorMind with dark mode support", time: "1 week ago", type: "update" },
  { icon: "🎉", text: "ShipFast CLI hit 1,000 views", time: "2 weeks ago", type: "milestone" },
];

const ProfileActivity = () => {
  return (
    <div className="max-w-xl">
      <div className="relative pl-6 space-y-6">
        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border/60" />
        {activities.map((item, i) => (
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
    </div>
  );
};

export default ProfileActivity;
