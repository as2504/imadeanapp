import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, CheckCircle2, UserCircle, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FollowListDialog from "./FollowListDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileHeaderProps { profileUserId?: string; }

const ProfileHeader = ({ profileUserId }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [dialogType, setDialogType] = useState<"followers" | "following" | null>(null);
  const isOwnProfile = !profileUserId || profileUserId === user?.id;
  const targetUserId = profileUserId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    const fetchProfile = async () => { const { data } = await supabase.from("profiles").select("*").eq("user_id", targetUserId).maybeSingle(); setProfile(data); };
    const fetchFollowers = async () => { const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", targetUserId); setFollowerCount(count || 0); };
    const fetchFollowing = async () => { const { count } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", targetUserId); setFollowingCount(count || 0); };
    const checkFollowing = async () => { if (!user || isOwnProfile) return; const { data } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", targetUserId).maybeSingle(); setIsFollowing(!!data); };
    fetchProfile(); fetchFollowers(); fetchFollowing(); checkFollowing();
  }, [targetUserId, user, isOwnProfile]);

  const handleFollow = async () => {
    if (!user || !targetUserId) return;
    if (isFollowing) { await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", targetUserId); setIsFollowing(false); setFollowerCount((c) => Math.max(0, c - 1)); }
    else { await supabase.from("follows").insert({ follower_id: user.id, following_id: targetUserId }); setIsFollowing(true); setFollowerCount((c) => c + 1); }
  };

  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
  const username = profile?.username || user?.email?.split("@")[0] || "user";

  const [isExtraSmall, setIsExtraSmall] = useState(false);

  useEffect(() => {
    const checkSize = () => setIsExtraSmall(window.innerWidth < 300);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <>
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-secondary flex items-center justify-center text-2xl font-bold text-primary overflow-hidden shrink-0">
          {profile?.avatar_url ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{displayName}</h1>
            <span className="text-xs text-primary flex items-center gap-1"><CheckCircle2 size={12} /> Verified</span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
            @{username}
            <span className="mx-1">·</span>
            <button onClick={() => setDialogType("followers")} className="hover:text-foreground transition-colors hover:underline">{followerCount} followers</button>
            <span className="mx-1">·</span>
            <button onClick={() => setDialogType("following")} className="hover:text-foreground transition-colors hover:underline">{followingCount} following</button>
          </p>
          {profile?.bio && <p className="text-sm text-muted-foreground/80 mt-2 max-w-lg">{profile.bio}</p>}
          <div className="flex items-center gap-2 mt-3">
            {isOwnProfile ? (
              <>
                {!isExtraSmall ? (
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => navigate("/edit-profile")} variant="outline" className="h-8 gap-1 text-xs"><Settings size={14} /> Edit Profile</Button>
                    <Button size="sm" onClick={() => navigate("/publish")} className="h-8 text-xs">Publish App</Button>
                  </div>
                ) : (
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 px-2.5 rounded-lg border-border/40">
                          <Settings size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44 p-1.5 rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl">
                        <DropdownMenuItem onClick={() => navigate("/edit-profile")} className="rounded-lg py-2 gap-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                          <UserCircle size={14} />
                          <span className="text-xs font-bold tracking-tight">Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/publish")} className="rounded-lg py-2 gap-3 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                          <Plus size={14} />
                          <span className="text-xs font-bold tracking-tight">Publish App</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </>
            ) : (
              <Button size="sm" onClick={handleFollow} variant={isFollowing ? "outline" : "default"} className="h-8 text-xs">
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>
      </div>
      {targetUserId && dialogType && (
        <FollowListDialog
          open={!!dialogType}
          onClose={() => setDialogType(null)}
          userId={targetUserId}
          type={dialogType}
        />
      )}
    </>
  );
};

export default ProfileHeader;
