import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FeedNavbar from "@/components/feed/FeedNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePublishedApps from "@/components/profile/ProfilePublishedApps";
import ProfileSavedApps from "@/components/profile/ProfileSavedApps";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileStatsStrip from "@/components/profile/ProfileStatsStrip";
import ProfileSidebar from "@/components/profile/ProfileSidebar";

const tabs = ["Published Apps", "Saved Apps", "Activity"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Published Apps");
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;
  const filteredTabs = tabs.filter(tab => tab !== "Saved Apps" || isOwnProfile);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-20">
        <ProfileHeader profileUserId={targetUserId} />
        <div className="mt-6"><ProfileStatsStrip profileUserId={targetUserId} /></div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-8 items-start">
          <div>
            <div className="flex items-center gap-1 border-b border-border/40 mb-6">
              {filteredTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {tab}
                  {activeTab === tab && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
                </button>
              ))}
            </div>
            {activeTab === "Published Apps" && <ProfilePublishedApps profileUserId={targetUserId} />}
            {activeTab === "Saved Apps" && isOwnProfile && <ProfileSavedApps />}
            {activeTab === "Activity" && <ProfileActivity />}
          </div>
          <aside className="sticky top-20"><ProfileSidebar profileUserId={targetUserId} /></aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
