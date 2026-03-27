import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, Loader2 } from "lucide-react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import EditProfileAvatar from "@/components/edit-profile/EditProfileAvatar";
import EditProfileIdentity from "@/components/edit-profile/EditProfileIdentity";
import EditProfileLinks from "@/components/edit-profile/EditProfileLinks";
import EditProfileExperience from "@/components/edit-profile/EditProfileExperience";
import EditProfileDevelopment from "@/components/edit-profile/EditProfileDevelopment";
import SidebarPanel from "@/components/layout/SidebarPanel";
import type { SocialLink } from "@/components/edit-profile/EditProfileLinks";

const tabs = ["Profile", "Experience", "Development"] as const;
type Tab = (typeof tabs)[number];

const EditProfile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const displayName =
        user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
    const username = user?.email?.split("@")[0] || "user";

    const [activeTab, setActiveTab] = useState<Tab>("Profile");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ── Profile state ──
    const [profile, setProfile] = useState({
        username,
        fullName: displayName,
        gender: "Male",
        dob: "1998-05-15",
        title: "AI Product Designer",
        location: "San Francisco, CA",
        bio: "Building the next generation of vibe-coded AI tools. ⚡",
        avatarUrl: null as string | null,
    });

    const [links, setLinks] = useState<SocialLink[]>([
        { id: "1", platform: "github", url: "https://github.com/creator" },
        { id: "2", platform: "twitter", url: "https://x.com/creator" },
    ]);

    const [experience, setExperience] = useState({
        education: [
            { id: "1", school: "Stanford University", degree: "BS Computer Science", year: "2020" }
        ],
        work: [
            { id: "1", company: "OpenAI", role: "Product Designer", years: "2" }
        ]
    });

    const [development, setDevelopment] = useState({
        primarySkill: "Full Stack Development",
        secondaryTools: ["Vercel", "Supabase", "Framer"],
        preferredPlatforms: ["Web Apps", "iOS"],
        isFindingWork: false,
        isOpenToCollaboration: true,
        lookingFor: ["Developers", "Co-founders"]
    });

    // ── Save status ──
    const [saveStatus, setSaveStatus] = useState("");
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Mark changes
    useEffect(() => {
        if (hasChanges) {
            setSaveStatus("Unsaved changes");
        }
    }, [hasChanges]);

    const markChanged = useCallback(() => {
        setHasChanges(true);
    }, []);

    const handleProfileChange = (field: string, value: any) => {
        setProfile((prev) => ({ ...prev, [field]: value }));
        markChanged();
    };

    const handleDevChange = (field: string, value: any) => {
        setDevelopment(prev => ({ ...prev, [field]: value }));
        markChanged();
    };

    const handleSave = () => {
        setIsSaving(true);
        setSaveStatus("Saving…");
        setTimeout(() => {
            setIsSaving(false);
            setSaveStatus("Saved ✓");
            setHasChanges(false);
            setTimeout(() => setSaveStatus(""), 3000);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background">
            <FeedNavbar />

            <main className="max-w-[1100px] mx-auto px-4 lg:px-6 pt-20 pb-32 md:pb-20">
                {/* Back button */}
                <div className="mb-6">
                    <button 
                        onClick={() => navigate("/account")}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-surface border border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ChevronLeft size={18} />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Profile</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* PRIMARY COLUMN (Left) */}
                    <div className="flex-1 min-w-0 bg-card border border-border/40 rounded-[2.5rem] p-6 sm:p-10 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-6">
                                <EditProfileAvatar
                                    initial={(profile.fullName || profile.username || "U").charAt(0).toUpperCase()}
                                    avatarUrl={profile.avatarUrl}
                                    onImageChange={(url) => {
                                        setProfile(p => ({ ...p, avatarUrl: url }));
                                        markChanged();
                                    }}
                                />
                                <div>
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{profile.fullName}</h1>
                                    <p className="text-xs text-muted-foreground/80 mt-1 max-w-sm line-clamp-1">{profile.bio}</p>
                                </div>
                            </div>
                            
                            {/* Mobile Sidebar Arrow */}
                            <button 
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl bg-surface border border-border/40 text-muted-foreground"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="border-b border-border/60 mb-8">
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`relative px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors duration-200 ${
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

                        {/* Tab Content Area */}
                        <div className="space-y-12">
                            {activeTab === "Profile" && (
                                <EditProfileIdentity
                                    data={profile}
                                    onChange={handleProfileChange}
                                />
                            )}

                            {activeTab === "Experience" && (
                                <EditProfileExperience
                                    education={experience.education}
                                    work={experience.work}
                                    onEducationChange={(edu) => {
                                        setExperience(prev => ({ ...prev, education: edu }));
                                        markChanged();
                                    }}
                                    onWorkChange={(w) => {
                                        setExperience(prev => ({ ...prev, work: w }));
                                        markChanged();
                                    }}
                                />
                            )}

                            {activeTab === "Development" && (
                                <EditProfileDevelopment
                                    {...development}
                                    onDataChange={handleDevChange}
                                />
                            )}
                        </div>
                    </div>

                    {/* SECONDARY COLUMN (Right) */}
                    <aside className="hidden lg:block w-[300px] shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <EditProfileLinks 
                                links={links} 
                                onChange={(l) => {
                                    setLinks(l);
                                    markChanged();
                                }} 
                            />

                            <div className="pt-2">
                                <Button 
                                    className="w-full rounded-xl h-11 text-xs font-bold shadow-md shadow-primary/10"
                                    onClick={handleSave}
                                    disabled={(!hasChanges && !saveStatus) || isSaving}
                                >
                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : (saveStatus || "Save Changes")}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Mobile Sidebar Panel */}
            <SidebarPanel 
                open={sidebarOpen} 
                onClose={() => setSidebarOpen(false)}
            >
                <div className="space-y-8">
                    <EditProfileLinks 
                        links={links} 
                        onChange={(l) => {
                            setLinks(l);
                            markChanged();
                        }} 
                    />
                    <Button 
                        className="w-full rounded-xl h-11 text-xs font-bold"
                        onClick={() => {
                            handleSave();
                            setSidebarOpen(false);
                        }}
                        disabled={(!hasChanges && !saveStatus) || isSaving}
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Save All"}
                    </Button>
                </div>
            </SidebarPanel>

            {/* Mobile sticky save bar */}
            {hasChanges && !sidebarOpen && (
                <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-gradient-to-t from-background via-background to-background/0">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
};

const Button = ({ children, className, ...props }: any) => (
    <button
        className={`bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default EditProfile;
