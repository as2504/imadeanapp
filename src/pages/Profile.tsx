import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import FeedNavbar from "@/components/feed/FeedNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePublishedApps from "@/components/profile/ProfilePublishedApps";
import ProfileSavedApps from "@/components/profile/ProfileSavedApps";
import ProfileDraftApps from "@/components/profile/ProfileDraftApps";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileStatsStrip from "@/components/profile/ProfileStatsStrip";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const allTabs = ["Published Apps", "Saved Apps", "Drafts", "Activity"] as const;
type Tab = (typeof allTabs)[number];

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("Published Apps");
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  const filteredTabs = allTabs.filter(tab => {
    if (tab === "Saved Apps" || tab === "Drafts") return isOwnProfile;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-20">
        <ProfileHeader profileUserId={targetUserId} />
        <div className="mt-6"><ProfileStatsStrip profileUserId={targetUserId} /></div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-8 items-start">
          <div>
            {/* Mobile: dropdown tabs */}
            {isMobile ? (
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
            ) : (
              <div className="flex items-center gap-1 border-b border-border/40 mb-6">
                {filteredTabs.map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {tab}
                    {activeTab === tab && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "Published Apps" && <ProfilePublishedApps profileUserId={targetUserId} />}
            {activeTab === "Saved Apps" && isOwnProfile && <ProfileSavedApps />}
            {activeTab === "Drafts" && isOwnProfile && <ProfileDraftApps />}
            {activeTab === "Activity" && <ProfileActivity />}
          </div>
          <aside className="sticky top-20"><ProfileSidebar profileUserId={targetUserId} /></aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
