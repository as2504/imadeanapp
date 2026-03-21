import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Share2, CheckCircle2, Zap } from "lucide-react";

const stats = [
  { value: "12", label: "Apps" },
  { value: "2.3K", label: "Likes" },
  { value: "540", label: "Followers" },
  { value: "8.1K", label: "Views" },
];

const ProfileHeader = () => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const username = user?.email?.split("@")[0] || "user";

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
      {/* Avatar — squircle */}
      <div className="relative group shrink-0 self-center sm:self-start">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28%] bg-surface border border-border/60 flex items-center justify-center text-3xl font-bold text-primary shadow-sm overflow-hidden">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <button className="absolute inset-0 rounded-[28%] bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-xs font-medium text-white bg-foreground/60 px-2 py-0.5 rounded-full">Edit</span>
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            {/* Username row */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{username}</h1>
              <CheckCircle2 size={18} className="text-primary fill-primary/10" />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                <Zap size={10} />
                Builder
              </span>
            </div>

            {/* Full name */}
            <p className="text-sm text-muted-foreground mt-0.5">{displayName}</p>

            {/* Bio */}
            <p className="text-sm text-foreground/80 mt-2 max-w-md leading-relaxed">
              Building the next generation of vibe-coded AI tools. ⚡
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 mt-4">
              {stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-9 text-xs">
              <Settings size={14} />
              Edit Profile
            </Button>
            <Button size="sm" className="rounded-full gap-1.5 h-9 text-xs">
              + Publish App
            </Button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
