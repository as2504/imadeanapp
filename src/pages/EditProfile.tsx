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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SocialLink } from "@/components/edit-profile/EditProfileLinks";

const tabs = ["Profile", "Experience", "Development"] as const;
type Tab = (typeof tabs)[number];

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("Profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ username: "", fullName: "", gender: "Prefer not to say", dob: "", title: "", location: "", bio: "", avatarUrl: null as string | null });
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [experience, setExperience] = useState({ education: [] as any[], work: [] as any[] });
  const [development, setDevelopment] = useState({ primarySkill: "", secondaryTools: [] as string[], preferredPlatforms: [] as string[], isFindingWork: false, isOpenToCollaboration: false, lookingFor: [] as string[] });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!user || !isFirstLoad) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle() as { data: any; error: any };
      if (error) { toast({ title: "Error", description: "Failed to load profile", variant: "destructive" }); }
      else if (data) {
        setProfile({ username: data.username || "", fullName: data.display_name || "", gender: data.gender || "Prefer not to say", dob: data.date_of_birth || "", title: data.professional_title || "", location: data.location || "", bio: data.bio || "", avatarUrl: data.avatar_url });
        setDevelopment({ primarySkill: data.primary_skill || "", secondaryTools: data.secondary_tools || [], preferredPlatforms: data.preferred_platforms || [], isFindingWork: data.looking_for_work || false, isOpenToCollaboration: data.open_to_collaboration || false, lookingFor: data.collaboration_looking_for || [] });
        setExperience({ 
          education: (data.education as any[]) || [], 
          work: (data.work_experience as any[]) || [] 
        });
      }

      setLoading(false); setIsFirstLoad(false);
    };
    fetchProfile();
  }, [user, toast, isFirstLoad]);

  const markChanged = useCallback(() => setHasChanges(true), []);
  const handleProfileChange = (field: string, value: any) => { setProfile((prev) => ({ ...prev, [field]: value })); markChanged(); };
  const handleDevChange = (field: string, value: any) => { setDevelopment(prev => ({ ...prev, [field]: value })); markChanged(); };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true); setSaveStatus("Saving…");
    try {
      const { error } = await supabase.from("profiles").update({
        display_name: profile.fullName, gender: profile.gender, date_of_birth: profile.dob, professional_title: profile.title, location: profile.location, bio: profile.bio, avatar_url: profile.avatarUrl,
        primary_skill: development.primarySkill, secondary_tools: development.secondaryTools, preferred_platforms: development.preferredPlatforms, looking_for_work: development.isFindingWork, open_to_collaboration: development.isOpenToCollaboration, collaboration_looking_for: development.lookingFor, 
        education: experience.education as any,
        work_experience: experience.work as any,
      }).eq("user_id", user.id);
      if (error) throw error;
      setSaveStatus("Saved ✓"); setHasChanges(false); setTimeout(() => setSaveStatus(""), 3000);
    } catch (err: any) { toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" }); setSaveStatus(""); }
    finally { setIsSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={24} /></div>;

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-20 pb-24">
        <button onClick={() => navigate("/account")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Profile
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar nav */}
          <div className="lg:w-48 shrink-0">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {tabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg text-left whitespace-nowrap transition-colors ${
                    activeTab === tab ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="hidden lg:block mt-6">
              <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="w-full h-9 text-sm">
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : (saveStatus || "Save Changes")}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-8">
            <div className="flex items-center gap-4 mb-4">
              <EditProfileAvatar initial={(profile.fullName || profile.username || "U").charAt(0).toUpperCase()} avatarUrl={profile.avatarUrl} onImageChange={(url) => { setProfile(p => ({ ...p, avatarUrl: url })); markChanged(); }} />
              <div>
                <h1 className="text-lg font-semibold text-foreground">{profile.fullName || "Your Profile"}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              </div>
            </div>

            {activeTab === "Profile" && <EditProfileIdentity data={profile} onChange={handleProfileChange} />}
            {activeTab === "Experience" && <EditProfileExperience education={experience.education} work={experience.work} onEducationChange={(edu) => { setExperience(prev => ({ ...prev, education: edu })); markChanged(); }} onWorkChange={(w) => { setExperience(prev => ({ ...prev, work: w })); markChanged(); }} />}
            {activeTab === "Development" && <EditProfileDevelopment {...development} onDataChange={handleDevChange} />}
          </div>
        </div>
      </main>

      {/* Mobile save */}
      {hasChanges && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 px-4 pb-3 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <Button onClick={handleSave} disabled={isSaving} className="w-full h-10">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
