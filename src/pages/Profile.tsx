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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, Bookmark, Activity } from "lucide-react";

const tabs = ["Published Apps", "Saved Apps", "Activity"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Published Apps");

  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  const getTabIcon = (tab: Tab) => {
    switch (tab) {
      case "Published Apps": return <LayoutGrid size={14} />;
      case "Saved Apps": return <Bookmark size={14} />;
      case "Activity": return <Activity size={14} />;
    }
  };

  const filteredTabs = tabs.filter(tab => tab !== "Saved Apps" || isOwnProfile);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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
            {/* Mobile Dropdown (Select) */}
            <div className="block sm:hidden">
              <Select value={activeTab} onValueChange={(val) => setActiveTab(val as Tab)}>
                <SelectTrigger className="w-full h-12 bg-card border-border/40 rounded-xl px-4 font-black uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-3">
                    {getTabIcon(activeTab)}
                    <SelectValue placeholder="Select tab" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40 rounded-xl p-1 shadow-2xl">
                  {filteredTabs.map((tab) => (
                    <SelectItem 
                      key={tab} 
                      value={tab} 
                      className="rounded-lg py-3 cursor-pointer font-black uppercase tracking-widest text-[10px]"
                    >
                      <div className="flex items-center gap-3">
                        {getTabIcon(tab)}
                        {tab}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-card border border-border/40 rounded-xl w-fit shadow-sm">
              {filteredTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-5 py-2 text-[10px] font-black rounded-lg transition-all duration-300 whitespace-nowrap uppercase tracking-widest ${
                    activeTab === tab
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                >
                  {getTabIcon(tab)}
                  {tab}
                </button>
              ))}
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
