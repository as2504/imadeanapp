import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import PlatformSelector from "./PlatformSelector";
import TagInput from "./TagInput";
import LivePreview from "./LivePreview";

const TAG_OPTIONS = ["AI", "Productivity", "Developer Tools", "Design", "Automation", "SaaS", "Mobile", "No-Code"];
const TECH_OPTIONS = ["React", "Next.js", "Supabase", "Firebase", "OpenAI", "Flutter", "Tailwind", "Node.js", "Python", "Vue", "Angular", "Svelte"];

const PublishForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const iconInputRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState("");
  const [tagline, setTagline] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [appStoreUrl, setAppStoreUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");
  const [pricing, setPricing] = useState("free");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const uploadIcon = async (): Promise<string | null> => {
    if (!iconFile || !user) return null;
    const ext = iconFile.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("app-assets").upload(path, iconFile);
    if (error) throw error;
    const { data } = supabase.storage.from("app-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const validate = () => {
    if (!appName.trim()) {
      toast({ title: "App name is required", variant: "destructive" });
      return false;
    }
    if (platforms.length === 0) {
      toast({ title: "Select at least one platform", variant: "destructive" });
      return false;
    }
    return true;
  };

  const save = async (status: "draft" | "published") => {
    if (!validate()) return;
    const setLoading = status === "draft" ? setSaving : setPublishing;
    setLoading(true);
    try {
      let iconUrl: string | null = null;
      if (iconFile) iconUrl = await uploadIcon();

      const payload = {
        user_id: user!.id,
        app_name: appName,
        tagline,
        full_description: fullDescription,
        tags,
        tech_stack: techStack,
        platforms,
        website_url: websiteUrl || null,
        play_store_url: playStoreUrl || null,
        app_store_url: appStoreUrl || null,
        caption,
        github_url: githubUrl || null,
        demo_video_url: demoVideoUrl || null,
        pricing,
        app_icon_url: iconUrl,
        status,
      };

      const { error } = await supabase.from("apps").insert(payload);
      if (error) throw error;

      toast({
        title: status === "published" ? "Your app is now live 🚀" : "Draft saved",
      });
      navigate("/account");
    } catch (err: any) {
      toast({ title: err.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={saving || publishing} className="rounded-full">
              {saving && <Loader2 size={14} className="animate-spin mr-1" />}
              Save Draft
            </Button>
            <Button size="sm" onClick={() => save("published")} disabled={saving || publishing} className="rounded-full">
              {publishing && <Loader2 size={14} className="animate-spin mr-1" />}
              Publish App
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-10">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Publish your creation.</h1>
          <p className="text-muted-foreground mt-1 text-sm">Share your app with the community and get discovered.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form — left */}
          <div className="lg:col-span-3 space-y-10">
            {/* 1. App Identity */}
            <section className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">App Identity</h2>

              {/* Icon */}
              <div className="flex items-center gap-5">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="w-20 h-20 rounded-[22%] bg-surface border border-dashed border-border hover:border-primary/40 flex items-center justify-center overflow-hidden transition-colors group"
                >
                  {iconPreview ? (
                    <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </button>
                <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
                <div>
                  <p className="text-sm font-medium text-foreground">App Icon</p>
                  <p className="text-xs text-muted-foreground mt-0.5">512×512 recommended. PNG or JPG.</p>
                </div>
              </div>

              <Input placeholder="App name" value={appName} onChange={(e) => setAppName(e.target.value)} className="rounded-xl text-base font-medium h-12" />
              <Input placeholder="One-line tagline (e.g. AI-powered task manager)" value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 80))} className="rounded-xl" />
              <p className="text-xs text-muted-foreground text-right -mt-3">{tagline.length}/80</p>
            </section>

            {/* 2. Description */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Description</h2>
              <Textarea
                placeholder="Explain what your app does and why it's useful..."
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="rounded-xl min-h-[120px]"
              />
            </section>

            {/* 3. Tech & Tags */}
            <section className="space-y-5">
              <TagInput label="Tech Stack" selected={techStack} suggestions={TECH_OPTIONS} onChange={setTechStack} placeholder="e.g. React, Supabase..." />
              <TagInput label="Tags" selected={tags} suggestions={TAG_OPTIONS} max={5} onChange={setTags} placeholder="e.g. AI, Productivity..." />
            </section>

            {/* 4. Platforms */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Platform Availability</h2>
              <PlatformSelector
                platforms={platforms}
                websiteUrl={websiteUrl}
                playStoreUrl={playStoreUrl}
                appStoreUrl={appStoreUrl}
                onToggle={togglePlatform}
                onUrlChange={(field, value) => {
                  if (field === "websiteUrl") setWebsiteUrl(value);
                  if (field === "playStoreUrl") setPlayStoreUrl(value);
                  if (field === "appStoreUrl") setAppStoreUrl(value);
                }}
              />
            </section>

            {/* 5. Caption */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-foreground">Feed Caption</h2>
              <Textarea
                placeholder="Built this to solve X problem… would love feedback!"
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 300))}
                className="rounded-xl min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground text-right -mt-2">{caption.length}/300</p>
            </section>

            {/* 6. Advanced */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown size={16} className={`transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`} />
                Advanced Settings
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <Input placeholder="GitHub repo URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="rounded-xl" />
                <Input placeholder="Demo video URL" value={demoVideoUrl} onChange={(e) => setDemoVideoUrl(e.target.value)} className="rounded-xl" />
                <div>
                  <label className="text-sm font-medium text-foreground">Pricing</label>
                  <div className="flex gap-2 mt-2">
                    {["free", "paid", "freemium"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPricing(p)}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize transition-all active:scale-[0.97] ${
                          pricing === p
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Mobile CTA */}
            <div className="lg:hidden flex gap-3 pt-4 border-t border-border/40">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => save("draft")} disabled={saving || publishing}>
                {saving && <Loader2 size={14} className="animate-spin mr-1" />}
                Save Draft
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => save("published")} disabled={saving || publishing}>
                {publishing && <Loader2 size={14} className="animate-spin mr-1" />}
                Publish App
              </Button>
            </div>
          </div>

          {/* Preview — right */}
          <div className="hidden lg:block lg:col-span-2">
            <LivePreview
              appName={appName}
              tagline={tagline}
              caption={caption}
              tags={tags}
              platforms={platforms}
              techStack={techStack}
              iconUrl={iconPreview}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublishForm;
