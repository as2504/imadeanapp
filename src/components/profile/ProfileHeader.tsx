import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Share2, CheckCircle2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profileUserId?: string;
}

const ProfileHeader = ({ profileUserId }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = !profileUserId || profileUserId === user?.id;
  const targetUserId = profileUserId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();
      setProfile(data);
    };

    const fetchFollowers = async () => {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", targetUserId);
      setFollowerCount(count || 0);
    };

    const checkFollowing = async () => {
      if (!user || isOwnProfile) return;
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();
      setIsFollowing(!!data);
    };

    fetchProfile();
    fetchFollowers();
    checkFollowing();
  }, [targetUserId, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !targetUserId) return;
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const username = profile?.username || user?.email?.split("@")[0] || "user";

  return (
    <div className="relative rounded-[2rem] bg-card border border-border/40 overflow-hidden shadow-xl">
      <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 scale-125 rotate-12">
          <Zap size={120} className="text-primary fill-primary" />
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-8 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row items-end gap-5">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-background border-4 border-card flex items-center justify-center text-4xl font-black text-primary shadow-xl overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => navigate("/edit-profile")}
                className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all group/edit"
              >
                <Settings size={16} className="group-hover/edit:rotate-90 transition-transform duration-500" />
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none uppercase">
                    {username}
                  </h1>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    <CheckCircle2 size={12} className="text-primary" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      Verified Builder
                    </span>
                  </div>
                </div>

                <p className="text-base font-bold text-muted-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground/60">
                  {followerCount} {followerCount === 1 ? "follower" : "followers"}
                </p>

                {profile?.bio && (
                  <p className="text-sm text-muted-foreground/80 max-w-xl leading-relaxed font-medium">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isOwnProfile ? (
                  <Button
                    onClick={() => navigate("/publish")}
                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all active:scale-95"
                  >
                    Publish App
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={`h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                      isFollowing
                        ? "border-border hover:border-destructive hover:text-destructive"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/10"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
                <button className="p-2.5 bg-surface hover:bg-surface-hover text-muted-foreground hover:text-foreground rounded-xl border border-border/40 transition-all active:scale-95">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
