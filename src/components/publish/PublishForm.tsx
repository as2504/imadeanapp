import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  X, Upload, Loader2, Plus, 
  Github, Play, Globe, Smartphone, Monitor, 
  Twitter, Instagram, Youtube, Linkedin, MessageSquare, 
  MoreHorizontal, Check, ArrowRight, ArrowLeft,
  Trash2, ShieldCheck, Sparkles, Zap,
  History as HistoryIcon,
  Link as LinkIcon,
  ExternalLink,
  Search
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const TECH_OPTIONS = ["React", "Next.js", "Supabase", "Tailwind", "OpenAI", "TypeScript", "Node.js", "Python", "Docker", "AWS", "Framer", "Vercel", "Flutter", "React Native"];
const TAG_OPTIONS = ["productivity", "health", "sports", "ai", "social", "fun", "minimal", "creative", "finance", "education"];

const SOCIAL_PLATFORMS = [
  { id: "twitter", label: "Twitter/X", icon: Twitter },
  { id: "discord", label: "Discord", icon: MessageSquare },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "youtube", label: "YouTube", icon: Youtube },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const isValidUrl = (url: string, required = false) => {
  if (!url) return !required;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const PublishForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const { toast } = useToast();
  const { user } = useAuth();
  
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Wizard State
  const [step, setStep] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [editAppStatus, setEditAppStatus] = useState<string | null>(null);
  const [showUpdateNoteModal, setShowUpdateNoteModal] = useState(false);
  const [updateNote, setUpdateNote] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    appName: "",
    caption: "",
    about: "",
    platforms: ["web"],
    techStack: [] as string[],
    tags: [] as string[],
    pricing: "free",
    urls: {
      web: "",
      android: "",
      ios: "",
      github: "",
      demo: ""
    },
    socialLinks: [] as { platform: string; url: string }[]
  });

  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load edit data
  useEffect(() => {
    if (!isEditMode || !editId || !user) return;
    const loadEditData = async () => {
      const { data } = await supabase.from("apps").select("*").eq("id", editId).maybeSingle();
      if (!data) return;
      setEditAppStatus(data.status);
      setFormData({
        appName: data.app_name || "",
        caption: data.caption || data.tagline || "",
        about: data.full_description || "",
        platforms: (data.platforms as string[]) || ["web"],
        techStack: data.tech_stack || [],
        tags: data.tags || [],
        pricing: data.pricing || "free",
        urls: {
          web: data.website_url || "",
          android: data.play_store_url || "",
          ios: data.app_store_url || "",
          github: data.github_url || "",
          demo: data.demo_video_url || "",
        },
        socialLinks: [],
      });
      if (data.app_icon_url) setIconPreview(data.app_icon_url);
      if (data.screenshots?.length) setScreenshotPreviews(data.screenshots);
    };
    loadEditData();
  }, [editId, isEditMode, user]);

  // Progress Calculation
  const progress = useMemo(() => {
    // Step 1: 0-25%
    const s1Fields = [formData.appName.trim(), formData.caption.trim(), formData.about.trim()].filter(Boolean).length;
    const s1 = (s1Fields / 3) * 25;

    // Step 2: 25-50%
    const s2 = iconPreview ? 25 : 0;

    // Step 3: 50-75%
    const s3Valid = formData.platforms.length > 0 && formData.platforms.every(p => 
      formData.urls[p as keyof typeof formData.urls]?.trim() && isValidUrl(formData.urls[p as keyof typeof formData.urls], true)
    );
    const s3 = s3Valid ? 25 : 0;

    // Step 4: 75-100%
    const s4Fields = [formData.techStack.length > 0, formData.tags.length > 0].filter(Boolean).length;
    const s4 = (s4Fields / 2) * 25;

    return Math.round(s1 + s2 + s3 + s4);
  }, [formData, iconPreview]);

  // Step Validation
  const validateStep = (s: number) => {
    const stepErrors: Record<string, string> = {};
    
    if (s === 1) {
      if (!formData.appName.trim()) stepErrors.appName = "App name is required";
      if (!formData.caption.trim()) stepErrors.caption = "Caption is required";
      if (!formData.about.trim()) stepErrors.about = "Description is required";
    }
    
    if (s === 2) {
      if (!iconPreview) stepErrors.icon = "App icon is required";
    }
    
    if (s === 3) {
      if (formData.platforms.length === 0) {
        stepErrors.platforms = "At least one platform is required";
      } else {
        if (formData.platforms.includes("web") && !formData.urls.web.trim()) stepErrors.webUrl = "Web URL is required";
        else if (formData.platforms.includes("web") && !isValidUrl(formData.urls.web, true)) stepErrors.webUrl = "Invalid URL format";

        if (formData.platforms.includes("android") && !formData.urls.android.trim()) stepErrors.androidUrl = "Android URL is required";
        else if (formData.platforms.includes("android")) {
          if (!isValidUrl(formData.urls.android, true)) stepErrors.androidUrl = "Invalid URL format";
          else if (!formData.urls.android.startsWith("https://play.google.com/")) stepErrors.androidUrl = "Must be a valid Google Play link";
        }

        if (formData.platforms.includes("ios") && !formData.urls.ios.trim()) stepErrors.iosUrl = "iOS URL is required";
        else if (formData.platforms.includes("ios")) {
          if (!isValidUrl(formData.urls.ios, true)) stepErrors.iosUrl = "Invalid URL format";
          else if (!formData.urls.ios.startsWith("https://apps.apple.com/")) stepErrors.iosUrl = "Must be a valid App Store link";
        }
      }
      
      if (formData.urls.github && !isValidUrl(formData.urls.github)) stepErrors.githubUrl = "Invalid URL format";
      if (formData.urls.demo && !isValidUrl(formData.urls.demo)) stepErrors.demoUrl = "Invalid URL format";
    }

    if (s === 4) {
      if (formData.techStack.length === 0) stepErrors.techStack = "At least one tech stack is required";
      if (formData.tags.length === 0) stepErrors.tags = "At least one tag is required";
      
      formData.socialLinks.forEach((link, i) => {
        if (link.url && !isValidUrl(link.url)) stepErrors[`social_${i}`] = "Invalid URL format";
      });
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, icon: "" }));
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - screenshotPreviews.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setScreenshotFiles(prev => [...prev, ...toAdd]);
    setScreenshotPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const togglePlatform = (p: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(p) 
        ? prev.platforms.filter(item => item !== p) 
        : [...prev.platforms, p]
    }));
    setErrors(prev => ({ ...prev, platforms: "" }));
  };

  const handleSubmit = async (noteOverride?: string) => {
    if (!validateStep(4)) return;
    if (!user) return;

    // If editing a published app and no update note yet, show dialog
    if (isEditMode && editAppStatus === "published" && !noteOverride && !updateNote) {
      setShowUpdateNoteModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload icon
      let iconUrl = iconPreview;
      if (iconFile) {
        const ext = iconFile.name.split('.').pop();
        const path = `icons/${user.id}/${Date.now()}.${ext}`;
        const { error: iconErr } = await supabase.storage.from('app-assets').upload(path, iconFile, { upsert: true });
        if (iconErr) throw iconErr;
        const { data: { publicUrl } } = supabase.storage.from('app-assets').getPublicUrl(path);
        iconUrl = publicUrl;
      }

      // Upload screenshots — iterate previews to maintain exact order and count
      let fileIdx = 0;
      const finalScreenshots: string[] = [];
      for (let i = 0; i < screenshotPreviews.length; i++) {
        const preview = screenshotPreviews[i];
        if (preview.startsWith('blob:')) {
          // Upload the corresponding file
          const file = screenshotFiles[fileIdx];
          fileIdx++;
          if (!file) continue;
          const ext = file.name.split('.').pop();
          const path = `screenshots/${user.id}/${Date.now()}_${i}.${ext}`;
          const { error: ssErr } = await supabase.storage.from('app-assets').upload(path, file, { upsert: true });
          if (ssErr) throw ssErr;
          const { data: { publicUrl } } = supabase.storage.from('app-assets').getPublicUrl(path);
          finalScreenshots.push(publicUrl);
        } else {
          // Keep existing URL as-is
          finalScreenshots.push(preview);
        }
      }

      const appData = {
        app_name: formData.appName,
        slug: slugify(formData.appName),
        caption: formData.caption,
        full_description: formData.about,
        tech_stack: formData.techStack,
        tags: formData.tags,
        platforms: formData.platforms,
        website_url: formData.urls.web || null,
        play_store_url: formData.urls.android || null,
        app_store_url: formData.urls.ios || null,
        github_url: formData.urls.github || null,
        demo_video_url: formData.urls.demo || null,
        pricing: formData.pricing,
        app_icon_url: iconUrl,
        screenshots: finalScreenshots,
        user_id: user.id,
        status: "published"
      };

      if (isEditMode && editId) {
        await supabase.from("apps").update(appData).eq("id", editId);
        
        // Insert update note for published apps
        const finalNote = noteOverride || updateNote;
        if (editAppStatus === "published" && finalNote?.trim()) {
          await supabase.from("app_updates").insert({
            app_id: editId,
            user_id: user.id,
            version_notes: finalNote.trim(),
          });
        }
      } else {
        await supabase.from("apps").insert(appData);
      }

      // Fire-and-forget: pre-generate OG share card
      try {
        const slug = slugify(formData.appName);
        fetch(`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/og-card?slug=${slug}&refresh=1`).catch(() => {});
      } catch {}

      setIsLive(true);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your progress has been saved as a draft.",
    });
    navigate("/account");
  };

  if (isLive) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 animate-in fade-in duration-700 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-bounce">
          <Check size={40} className="text-primary" />
        </div>
        <h2 className="text-3xl font-black mb-2">Your app is live!</h2>
        <p className="text-muted-foreground mb-8 text-center">The community can now discover your creation.</p>
        <Button onClick={() => navigate("/account")} className="rounded-xl px-8 font-bold">
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 md:py-20 px-4">
      {/* Wizard Container */}
      <div className="max-w-[680px] mx-auto bg-card rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative">
        
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-50 bg-card border-b border-border/40 px-6 h-14 flex items-center justify-between gap-4">
          <button 
            onClick={() => {
              if (formData.appName || iconPreview) setShowCancelModal(true);
              else navigate(-1);
            }}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>

          <div className="flex-1 flex items-center gap-3 max-w-[300px]">
            <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center animate-in scale-in duration-300">
                <Check size={10} className="text-white" strokeWidth={4} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveDraft}
              className="hidden sm:flex rounded-lg text-[10px] h-8 font-bold border-border/40"
            >
              Save as Draft
            </Button>
          </div>
        </header>

        {/* Step Content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-0.5">
                   <h2 className="text-lg font-black">App Info</h2>
                   <p className="text-[11px] text-muted-foreground">The foundation of your application's identity.</p>
                </div>
                
                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">App Name *</label>
                    <div className="relative">
                      <Input 
                        placeholder="What's your app called?"
                        value={formData.appName}
                        onChange={e => {
                          setFormData({ ...formData, appName: e.target.value.slice(0, 20) });
                          if (errors.appName) setErrors(prev => ({ ...prev, appName: "" }));
                        }}
                        className={cn(
                          "h-10 rounded-lg bg-background border-border/40 focus:ring-primary/20 transition-all text-xs font-semibold pr-12",
                          errors.appName && "border-destructive focus:ring-destructive/20"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground/40">{formData.appName.length}/20</span>
                    </div>
                    {errors.appName && <p className="text-[9px] text-destructive font-bold ml-1">{errors.appName}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Caption *</label>
                    <div className="relative">
                      <Input 
                        placeholder="Short, punchy tagline..."
                        value={formData.caption}
                        onChange={e => {
                          setFormData({ ...formData, caption: e.target.value.slice(0, 150) });
                          if (errors.caption) setErrors(prev => ({ ...prev, caption: "" }));
                        }}
                        className={cn(
                          "h-10 rounded-lg bg-background border-border/40 focus:ring-primary/20 transition-all text-xs font-semibold pr-12",
                          errors.caption && "border-destructive focus:ring-destructive/20"
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground/40">{formData.caption.length}/150</span>
                    </div>
                    {errors.caption && <p className="text-[9px] text-destructive font-bold ml-1">{errors.caption}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">About the App *</label>
                    <Textarea 
                      placeholder="Describe the magic behind your app..."
                      value={formData.about}
                      onChange={e => {
                        setFormData({ ...formData, about: e.target.value });
                        if (errors.about) setErrors(prev => ({ ...prev, about: "" }));
                      }}
                      className={cn(
                        "min-h-[140px] rounded-xl bg-background border-border/40 focus:ring-primary/20 transition-all text-xs leading-relaxed",
                        errors.about && "border-destructive focus:ring-destructive/20"
                      )}
                    />
                    {errors.about && <p className="text-[9px] text-destructive font-bold ml-1">{errors.about}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-0.5">
                   <h2 className="text-lg font-black">Visuals</h2>
                   <p className="text-[11px] text-muted-foreground">Visuals that define your brand experience.</p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">App Icon *</label>
                    <div className="flex items-start gap-5">
                      <button
                        onClick={() => iconInputRef.current?.click()}
                        className={cn(
                          "w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 bg-background hover:bg-accent/5 transition-all overflow-hidden shrink-0",
                          errors.icon ? "border-destructive" : "border-border/60 hover:border-primary/40"
                        )}
                      >
                        {iconPreview ? (
                          <img src={iconPreview} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                            <Upload size={18} className="text-muted-foreground/40" />
                            <span className="text-[8px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-tight">Upload</span>
                          </div>
                        )}
                      </button>
                      <input ref={iconInputRef} type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
                      <div className="flex-1 pt-1">
                        <p className="text-xs font-bold text-foreground">Icon Preview</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed">180×180 px recommended. Square crop works best.</p>
                        {errors.icon && <p className="text-[9px] text-destructive font-bold mt-1.5">{errors.icon}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Gallery</label>
                    <p className="text-[9px] text-muted-foreground/60 ml-0.5">These images will be shown in the gallery section of app details after publishing.</p>
                    <div className="flex flex-wrap gap-2.5">
                      {screenshotPreviews.map((src, i) => (
                        <div key={i} className="relative w-40 aspect-video rounded-lg overflow-hidden border border-border/20 shadow-sm group">
                          <img src={src} className="w-full h-full object-cover" />
                          <button 
                            onClick={() => {
                              // If removing a blob URL, also remove the corresponding file
                              if (screenshotPreviews[i]?.startsWith('blob:')) {
                                const fileIndex = screenshotPreviews.slice(0, i).filter(p => p.startsWith('blob:')).length;
                                setScreenshotFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
                              }
                              setScreenshotPreviews(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="absolute top-1 right-1 p-0.5 bg-background/80 backdrop-blur-md text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {screenshotPreviews.length < 3 && (
                        <button 
                          onClick={() => screenshotInputRef.current?.click()}
                          className="w-40 aspect-video rounded-lg border-2 border-dashed border-border/40 bg-background flex flex-col items-center justify-center hover:border-primary/40 transition-all group"
                        >
                          <Plus size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[8px] font-bold text-muted-foreground/50 uppercase">Add</span>
                        </button>
                      )}
                    </div>
                    <input ref={screenshotInputRef} type="file" className="hidden" multiple accept="image/*" onChange={handleScreenshotChange} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-0.5">
                   <h2 className="text-lg font-black">Where it runs & Links</h2>
                   <p className="text-[11px] text-muted-foreground">Distribution platforms and primary links.</p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5 flex items-center gap-2">
                        Platforms *
                        {formData.platforms.length > 0 && (
                          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[8px]">{formData.platforms.length}</span>
                        )}
                      </label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-secondary transition-colors group">
                            <Plus size={14} className="text-primary group-hover:rotate-90 transition-transform" strokeWidth={3} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-border bg-popover/95 backdrop-blur-xl shadow-2xl">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5 mb-1">Add Platform</p>
                          {[
                            { id: "web", label: "Web", icon: Globe },
                            { id: "android", label: "Android", icon: Smartphone },
                            { id: "ios", label: "iOS", icon: Monitor },
                          ].map((p) => (
                            <DropdownMenuItem 
                              key={p.id} 
                              onClick={(e) => {
                                e.preventDefault();
                                togglePlatform(p.id);
                              }}
                              className="rounded-lg py-1.5 gap-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                formData.platforms.includes(p.id) ? "bg-primary border-primary text-white" : "border-border/40"
                              )}>
                                {formData.platforms.includes(p.id) && <Check size={10} strokeWidth={4} />}
                              </div>
                              <p.icon size={14} className="opacity-60" />
                              <span className="text-[11px] font-bold">{p.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.platforms.map(p => {
                        const label = p === 'web' ? 'Web' : p === 'android' ? 'Android' : 'iOS';
                        const Icon = p === 'web' ? Globe : p === 'android' ? Smartphone : Monitor;
                        return (
                          <div key={p} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 text-primary animate-in zoom-in-95 duration-200">
                            <Icon size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                            <button onClick={() => togglePlatform(p)} className="hover:text-destructive transition-colors ml-1">
                              <X size={10} strokeWidth={3} />
                            </button>
                          </div>
                        );
                      })}
                      {formData.platforms.length === 0 && (
                        <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest pt-1 pl-1 italic">Click + to select at least one platform</p>
                      )}
                    </div>
                    
                    {errors.platforms && <p className="text-[9px] text-destructive font-bold ml-1">{errors.platforms}</p>}

                    <div className="space-y-3 animate-in fade-in duration-500">
                      {formData.platforms.includes("web") && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Web URL</label>
                          <Input 
                            placeholder="https://yourapp.com" 
                            value={formData.urls.web} 
                            onChange={e => setFormData({ ...formData, urls: { ...formData.urls, web: e.target.value }})} 
                            className={cn("h-9 rounded-lg bg-background border-border/40 text-[11px]", errors.webUrl && "border-destructive")}
                          />
                          {errors.webUrl && <p className="text-[9px] text-destructive font-bold ml-1">Give a correct URL</p>}
                        </div>
                      )}
                      {formData.platforms.includes("android") && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">Android Play Store</label>
                          <Input 
                            placeholder="https://play.google.com/..." 
                            value={formData.urls.android} 
                            onChange={e => setFormData({ ...formData, urls: { ...formData.urls, android: e.target.value }})} 
                            className={cn("h-9 rounded-lg bg-background border-border/40 text-[11px]", errors.androidUrl && "border-destructive")}
                          />
                          {errors.androidUrl && <p className="text-[9px] text-destructive font-bold ml-1">{errors.androidUrl}</p>}
                        </div>
                      )}
                      {formData.platforms.includes("ios") && (
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground/60 uppercase ml-1">iOS App Store</label>
                          <Input 
                            placeholder="https://apps.apple.com/..." 
                            value={formData.urls.ios} 
                            onChange={e => setFormData({ ...formData, urls: { ...formData.urls, ios: e.target.value }})} 
                            className={cn("h-9 rounded-lg bg-background border-border/40 text-[11px]", errors.iosUrl && "border-destructive")}
                          />
                          {errors.iosUrl && <p className="text-[9px] text-destructive font-bold ml-1">{errors.iosUrl}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">GitHub</label>
                      <div className="relative">
                        <Github size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <Input 
                          placeholder="Repository URL" 
                          value={formData.urls.github} 
                          onChange={e => setFormData({ ...formData, urls: { ...formData.urls, github: e.target.value }})} 
                          className={cn("h-9 rounded-lg bg-background border-border/40 pl-9 text-[11px] font-semibold", errors.githubUrl && "border-destructive")}
                        />
                      </div>
                      {errors.githubUrl && <p className="text-[9px] text-destructive font-bold ml-1">Give a correct URL</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Demo Video</label>
                      <div className="relative">
                        <Play size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                        <Input 
                          placeholder="Video URL" 
                          value={formData.urls.demo} 
                          onChange={e => setFormData({ ...formData, urls: { ...formData.urls, demo: e.target.value }})} 
                          className={cn("h-9 rounded-lg bg-background border-border/40 pl-9 text-[11px] font-semibold", errors.demoUrl && "border-destructive")}
                        />
                      </div>
                      {errors.demoUrl && <p className="text-[9px] text-destructive font-bold ml-1">Give a correct URL</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-0.5">
                   <h2 className="text-lg font-black">Tags, Tech & Pricing</h2>
                   <p className="text-[11px] text-muted-foreground">Classify your app, specify its tech stack and pricing model.</p>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Pricing Model</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "free", label: "Free", icon: Sparkles, color: "text-emerald-500" },
                        { id: "freemium", label: "Freemium", icon: Zap, color: "text-primary" },
                        { id: "paid", label: "Paid", icon: ShieldCheck, color: "text-amber-500" },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setFormData({ ...formData, pricing: p.id })}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border transition-all duration-200 cursor-pointer",
                            formData.pricing === p.id 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-border/40 bg-background text-muted-foreground hover:border-border"
                          )}
                        >
                          <p.icon size={18} className={cn(formData.pricing === p.id ? p.color : "opacity-40")} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", formData.pricing === p.id ? "text-foreground" : "text-muted-foreground/60")}>
                            {p.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <TagSelector 
                    label="Tech Stack"
                    suggestions={TECH_OPTIONS}
                    selected={formData.techStack}
                    onChange={tags => setFormData({ ...formData, techStack: tags })}
                  />
                  <TagSelector 
                    label="Tags"
                    suggestions={TAG_OPTIONS}
                    selected={formData.tags}
                    onChange={tags => setFormData({ ...formData, tags: tags })}
                    max={8}
                  />

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Social Links</label>
                      <button 
                        onClick={() => setFormData({ ...formData, socialLinks: [...formData.socialLinks, { platform: "twitter", url: "" }] })}
                        className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                      >
                        + Add
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {formData.socialLinks.map((link, i) => (
                        <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                          <Select 
                            value={link.platform} 
                            onValueChange={val => {
                              const newLinks = [...formData.socialLinks];
                              newLinks[i].platform = val;
                              setFormData({ ...formData, socialLinks: newLinks });
                            }}
                          >
                            <SelectTrigger className="w-24 h-9 rounded-lg bg-background border-border/40 text-[10px] font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card">
                              {SOCIAL_PLATFORMS.map(p => (
                                <SelectItem key={p.id} value={p.id} className="text-[10px] font-bold">
                                  <div className="flex items-center gap-2">
                                    <p.icon size={10} /> {p.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex-1 relative">
                            <Input 
                              placeholder="URL" 
                              value={link.url} 
                              onChange={e => {
                                const newLinks = [...formData.socialLinks];
                                newLinks[i].url = e.target.value;
                                setFormData({ ...formData, socialLinks: newLinks });
                              }}
                              className={cn("h-9 rounded-lg bg-background border-border/40 pr-9 text-[10px] font-semibold", errors[`social_${i}`] && "border-destructive")}
                            />
                            {errors[`social_${i}`] && <p className="text-[9px] text-destructive font-bold mt-1">Give a correct URL</p>}
                            <button 
                              onClick={() => setFormData({ ...formData, socialLinks: formData.socialLinks.filter((_, idx) => idx !== i) })}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-destructive transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Fixed Bottom Bar */}
        <footer className="border-t border-border/40 px-6 py-4 flex items-center justify-between bg-card/80 backdrop-blur-sm">
          <div>
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
          </div>

          <Button 
            onClick={step === 4 ? () => handleSubmit() : nextStep} 
            disabled={isSubmitting || (step === 4 && (formData.techStack.length === 0 || formData.tags.length === 0 || !formData.pricing))}
            className="rounded-lg px-6 font-black text-[10px] uppercase tracking-widest h-10 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : step === 4 ? "Publish App" : "Next"} 
            {step < 4 && <ArrowRight size={14} />}
          </Button>
        </footer>

        {/* Cancel Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="rounded-3xl border-border/40 shadow-2xl p-8 max-w-[400px]">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-2">
                <HistoryIcon size={24} className="text-amber-500" />
              </div>
              <DialogTitle className="text-2xl font-black">
                {isEditMode ? "Discard changes?" : "Save draft before leaving?"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isEditMode
                  ? "Your changes will not be saved. Are you sure you want to leave?"
                  : "You have unsaved changes. Do you want to save them as a draft or discard everything?"}
              </p>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6">
              {isEditMode ? (
                <>
                  <Button variant="ghost" className="flex-1 rounded-xl font-bold h-11" onClick={() => setShowCancelModal(false)}>
                    Keep Editing
                  </Button>
                  <Button variant="destructive" className="flex-1 rounded-xl font-bold h-11" onClick={() => navigate(-1)}>
                    Discard & Leave
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="flex-1 rounded-xl font-bold h-11" onClick={() => navigate(-1)}>
                    Discard
                  </Button>
                  <Button className="flex-1 rounded-xl font-bold h-11" onClick={() => navigate(-1)}>
                    Save & Exit
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Note Modal */}
        <Dialog open={showUpdateNoteModal} onOpenChange={setShowUpdateNoteModal}>
          <DialogContent className="rounded-3xl border-border/40 shadow-2xl p-8 max-w-[400px]">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
                <HistoryIcon size={24} className="text-primary" />
              </div>
              <DialogTitle className="text-2xl font-black">What's new?</DialogTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Describe what you updated so your users know what changed.
              </p>
            </DialogHeader>
            <Textarea
              placeholder="e.g. Fixed bugs, added dark mode support..."
              value={updateNote}
              onChange={(e) => setUpdateNote(e.target.value)}
              className="min-h-[100px] rounded-xl bg-background border-border/40 text-sm mt-2"
            />
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button variant="ghost" className="flex-1 rounded-xl font-bold h-11" onClick={() => setShowUpdateNoteModal(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl font-bold h-11"
                disabled={!updateNote.trim() || isSubmitting}
                onClick={() => {
                  setShowUpdateNoteModal(false);
                  handleSubmit(updateNote);
                }}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Save & Publish"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

const TagSelector = ({ label, suggestions, selected, onChange, max }: any) => {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = suggestions.filter((s: string) => 
    s.toLowerCase().includes(input.toLowerCase()) && !selected.includes(s)
  );

  const add = (tag: string) => {
    if (max && selected.length >= max) return;
    if (selected.includes(tag)) return;
    onChange([...selected, tag]);
    setInput("");
    setOpen(false);
  };

  const remove = (tag: string) => onChange(selected.filter((t: string) => t !== tag));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">{label}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="p-1 rounded-md hover:bg-secondary transition-colors">
              <Plus size={14} className="text-primary" strokeWidth={3} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-60 p-2 rounded-xl border-border bg-card shadow-2xl">
            <div className="relative mb-2">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && input.trim()) {
                    add(input.trim());
                  }
                }}
                className="h-8 rounded-lg bg-background border-border/40 pl-8 text-xs font-semibold"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-0.5">
              {filtered.map((s: string) => (
                <button key={s} onClick={() => add(s)} className="w-full text-left px-3 py-1.5 text-[11px] font-bold hover:bg-secondary rounded-lg transition-colors">
                  {s}
                </button>
              ))}
              {input && !suggestions.some((s: any) => s.toLowerCase() === input.toLowerCase()) && (
                <button onClick={() => add(input.trim())} className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-secondary rounded-lg transition-colors">
                  Add "{input}"
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {selected.map((tag: string) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold border border-primary/20">
            {tag}
            <button onClick={() => remove(tag)} className="hover:text-destructive transition-colors">
              <X size={10} strokeWidth={3} />
            </button>
          </span>
        ))}
        {selected.length === 0 && <p className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-widest pt-1 pl-1">None</p>}
      </div>
    </div>
  );
};

export default PublishForm;
