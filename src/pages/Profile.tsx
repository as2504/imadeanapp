import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import SEO from "@/components/SEO";
import FeedNavbar from "@/components/feed/FeedNavbar";
import PublicNavbar from "@/components/layout/PublicNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePublishedApps from "@/components/profile/ProfilePublishedApps";
import ProfileSavedApps from "@/components/profile/ProfileSavedApps";
import ProfileDraftApps from "@/components/profile/ProfileDraftApps";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileStatsStrip from "@/components/profile/ProfileStatsStrip";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const allTabs = ["Published Apps", "Saved Apps", "Drafts", "Activity"] as const;
type Tab = (typeof allTabs)[number];

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("Published Apps");

  const isAuthenticated = !!user;
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  // Track profile view (unique per viewer)
  useEffect(() => {
    if (!targetUserId || !user?.id || user.id === targetUserId) return;
    supabase
      .from("profile_views")
      .upsert({ user_id: targetUserId, viewer_id: user.id }, { onConflict: "user_id,viewer_id" })
      .then(() => {});
  }, [targetUserId, user?.id]);

  // For unauthenticated users, only show published apps
  const filteredTabs = isAuthenticated
    ? allTabs.filter(tab => {
        if (tab === "Saved Apps" || tab === "Drafts") return isOwnProfile;
        return true;
      })
    : (["Published Apps"] as const);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Profile – imadeanapp`}
        description="Creator profile on imadeanapp (I Made An App). Discover their published apps, activity, and portfolio."
        canonical={typeof window !== "undefined" ? window.location.href : undefined}
        type="profile"
      />
      {isAuthenticated ? <FeedNavbar /> : <PublicNavbar />}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-20">
        <ProfileHeader profileUserId={targetUserId} />
        <div className="mt-6"><ProfileStatsStrip profileUserId={targetUserId} /></div>

        {/* CTA for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mt-6 p-4 rounded-xl border border-border/40 bg-card/50 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Want to publish your own apps and join the community?</p>
            <Button size="sm" onClick={() => navigate("/auth")} className="gap-2 shrink-0">
              <LogIn size={14} /> Log in to publish
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-8 items-start">
          <div>
            {filteredTabs.length > 1 && isMobile ? (
              <div className="mb-6">
                <Select value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
                  <SelectTrigger className="w-full h-10 bg-card border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTabs.map((tab) => (
                      <SelectItem key={tab} value={tab}>{tab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : filteredTabs.length > 1 ? (
              <div className="flex items-center gap-1 border-b border-border/40 mb-6">
                {filteredTabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab as Tab)}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
            ) : null}

            {activeTab === "Published Apps" && <ProfilePublishedApps profileUserId={targetUserId} />}
            {activeTab === "Saved Apps" && isOwnProfile && isAuthenticated && <ProfileSavedApps />}
            {activeTab === "Drafts" && isOwnProfile && isAuthenticated && <ProfileDraftApps />}
            {activeTab === "Activity" && isAuthenticated && <ProfileActivity />}
          </div>
          <aside className="sticky top-20"><ProfileSidebar profileUserId={targetUserId} /></aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
