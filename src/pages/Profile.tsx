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

  return (
    <div className="min-h-screen bg-[#F1F5F9] transition-colors duration-300">
      <FeedNavbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        <div className="mb-8">
          <ProfileHeader profileUserId={targetUserId} />
        </div>

        <div className="mb-8">
          <ProfileStatsStrip profileUserId={targetUserId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-6">
            <div className="flex items-center gap-1 p-1 bg-card border border-border/40 rounded-xl w-fit overflow-x-auto scrollbar-hide shadow-sm">
              {tabs.map((tab) => {
                // Hide "Saved Apps" tab on other people's profiles
                if (tab === "Saved Apps" && !isOwnProfile) return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 text-xs font-black rounded-lg transition-all duration-300 whitespace-nowrap uppercase tracking-wider ${
                      activeTab === tab
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              {activeTab === "Published Apps" && <ProfilePublishedApps profileUserId={targetUserId} />}
              {activeTab === "Saved Apps" && isOwnProfile && <ProfileSavedApps />}
              {activeTab === "Activity" && <ProfileActivity />}
            </div>
          </div>

          <aside className="sticky top-20">
            <ProfileSidebar profileUserId={targetUserId} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
