import { useState } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileOverview from "@/components/profile/ProfileOverview";
import ProfilePublishedApps from "@/components/profile/ProfilePublishedApps";
import ProfileSavedApps from "@/components/profile/ProfileSavedApps";
import ProfileActivity from "@/components/profile/ProfileActivity";

const tabs = ["Overview", "Published Apps", "Saved Apps", "Activity"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />

      <main className="max-w-[1080px] mx-auto px-4 lg:px-6 pt-20 pb-24 md:pb-12">
        <ProfileHeader />

        {/* Tabs */}
        <div className="mt-8 border-b border-border/60">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-8">
          {activeTab === "Overview" && <ProfileOverview />}
          {activeTab === "Published Apps" && <ProfilePublishedApps />}
          {activeTab === "Saved Apps" && <ProfileSavedApps />}
          {activeTab === "Activity" && <ProfileActivity />}
        </div>
      </main>
    </div>
  );
};

export default Profile;
