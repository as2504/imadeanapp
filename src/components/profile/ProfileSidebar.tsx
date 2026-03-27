import { useState, useEffect } from "react";
import { Github, Twitter, Linkedin, ExternalLink, Globe, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileSidebarProps {
  profileUserId?: string;
}

const ProfileSidebar = ({ profileUserId }: ProfileSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  const targetUserId = profileUserId || user?.id;
  const isOwnProfile = !profileUserId || profileUserId === user?.id;

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
    fetchProfile();
  }, [targetUserId]);

  const socialLinks = [
    profile?.github_url && { icon: Github, label: "GitHub", url: profile.github_url },
    profile?.twitter_url && { icon: Twitter, label: "Twitter", url: profile.twitter_url },
    profile?.linkedin_url && { icon: Linkedin, label: "LinkedIn", url: profile.linkedin_url },
    profile?.website && { icon: Globe, label: "Website", url: profile.website },
    profile?.portfolio_url && { icon: ExternalLink, label: "Portfolio", url: profile.portfolio_url },
  ].filter(Boolean) as { icon: any; label: string; url: string }[];

  // Completion items for own profile
  const completionItems = isOwnProfile
    ? [
        { label: "Display Name", done: !!profile?.display_name },
        { label: "Bio Added", done: !!profile?.bio },
        { label: "Avatar Uploaded", done: !!profile?.avatar_url },
        { label: "Social Link Added", done: socialLinks.length > 0 },
      ]
    : [];

  const completionPercent = completionItems.length
    ? Math.round((completionItems.filter((i) => i.done).length / completionItems.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Profile Strength — only for own profile */}
      {isOwnProfile && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-primary" />
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Profile Strength
            </h3>
          </div>

          <div className="flex items-end justify-between mb-3">
            <span className="text-3xl font-black text-foreground">{completionPercent}%</span>
            <span className="text-xs font-bold text-muted-foreground">
              {completionItems.filter((i) => i.done).length}/{completionItems.length}
            </span>
          </div>

          <Progress value={completionPercent} className="h-2 mb-4 bg-surface" />

          <div className="space-y-2">
            {completionItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${item.done ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
                <span className={item.done ? "text-foreground font-bold" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => navigate("/edit-profile")}
            className="w-full mt-4 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black text-[10px] uppercase tracking-widest"
          >
            Complete Profile
          </Button>
        </section>
      )}

      {/* Social Connections */}
      {socialLinks.length > 0 && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
            Connections
          </h3>
          <div className="space-y-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/10 transition-colors group"
              >
                <link.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold text-foreground">{link.label}</span>
                <ExternalLink size={12} className="text-muted-foreground/30 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </section>
      )}

      {/* About section for other profiles */}
      {!isOwnProfile && profile && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
            About
          </h3>
          <div className="space-y-3 text-sm">
            {profile.professional_title && (
              <p className="font-bold text-foreground">{profile.professional_title}</p>
            )}
            {profile.location && (
              <p className="text-muted-foreground">📍 {profile.location}</p>
            )}
            {profile.primary_skill && (
              <p className="text-muted-foreground">💡 {profile.primary_skill}</p>
            )}
            {profile.open_to_collaboration && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                Open to collaborate
              </div>
            )}
          </div>
        </section>
      )}

      {socialLinks.length === 0 && !isOwnProfile && (
        <section className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm text-center">
          <p className="text-sm text-muted-foreground">No social links added yet.</p>
        </section>
      )}
    </div>
  );
};

export default ProfileSidebar;
