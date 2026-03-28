import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, Share2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps { profileUserId?: string; }

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
    const fetchProfile = async () => { const { data } = await supabase.from("profiles").select("*").eq("user_id", targetUserId).maybeSingle(); setProfile(data); };
    const fetchFollowers = async () => { const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetUserId); setFollowerCount(count || 0); };
    const checkFollowing = async () => { if (!user || isOwnProfile) return; const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", targetUserId).maybeSingle(); setIsFollowing(!!data); };
    fetchProfile(); fetchFollowers(); checkFollowing();
  }, [targetUserId, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !targetUserId) return;
    if (isFollowing) { await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId); setIsFollowing(false); setFollowerCount((c) => Math.max(0, c - 1)); }
    else { await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId }); setIsFollowing(true); setFollowerCount((c) => c + 1); }
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const username = profile?.username || user?.email?.split("@")[0] || "user";

  return (
    <div className="flex items-start gap-5">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-primary overflow-hidden shrink-0">
        {profile?.avatar_url ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-foreground">{displayName}</h1>
          <span className="text-xs text-primary flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">@{username} · {followerCount} followers</p>
        {profile?.bio && <p className="text-sm text-muted-foreground/80 mt-2 max-w-lg">{profile.bio}</p>}
        <div className="flex items-center gap-2 mt-3">
          {isOwnProfile ? (
            <>
              <Button size="sm" onClick={() => navigate("/edit-profile")} variant="outline" className="h-8 gap-1 text-xs"><Settings size={14} /> Edit Profile</Button>
              <Button size="sm" onClick={() => navigate("/publish")} className="h-8 text-xs">Publish App</Button>
            </>
          ) : (
            <Button size="sm" onClick={handleFollow} variant={isFollowing ? "outline" : "default"} className="h-8 text-xs">
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
