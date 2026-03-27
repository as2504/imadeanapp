import { useState } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileOverview from "@/components/profile/ProfileOverview";
import ProfilePublishedApps from "@/components/profile/ProfilePublishedApps";
import ProfileSavedApps from "@/components/profile/ProfileSavedApps";
import ProfileActivity from "@/components/profile/ProfileActivity";
import ProfileStatsStrip from "@/components/profile/ProfileStatsStrip";
import ProfileSidebar from "@/components/profile/ProfileSidebar";

const tabs = ["Published Apps", "Saved Apps", "Activity"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Published Apps");

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <FeedNavbar />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
        {/* Header Section */}
        <div className="mb-8">
          <ProfileHeader />
        </div>

        {/* Stats Strip */}
        <div className="mb-8">
          <ProfileStatsStrip />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* LEFT SIDE — Content Area */}
          <div className="space-y-6">
            {/* Navigation Tabs - Compact */}
            <div className="flex items-center gap-1 p-1 bg-card border border-border/40 rounded-xl w-fit overflow-x-auto scrollbar-hide shadow-sm">
              {tabs.map((tab) => (
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
              ))}
            </div>

            {/* Tab content with transition */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
              {activeTab === "Published Apps" && <ProfilePublishedApps />}
              {activeTab === "Saved Apps" && <ProfileSavedApps />}
              {activeTab === "Activity" && <ProfileActivity />}
            </div>
          </div>

          {/* RIGHT SIDE — Sidebar */}
          <aside className="sticky top-20">
            <ProfileSidebar />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;
