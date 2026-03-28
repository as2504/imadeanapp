import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Upload, Loader2, X, ImagePlus, CheckCircle2, 
  Info, Pencil, Bold, Italic, Underline, List, Plus, 
  ChevronDown, Github, Play,
  CircleDollarSign, CreditCard, Gift, Rocket, Eye, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TECH_OPTIONS = ["React", "Next.js", "Supabase", "Tailwind", "OpenAI", "TypeScript", "Node.js", "Python", "Docker", "AWS", "Framer", "Vercel"];
const TAG_OPTIONS = ["AI", "SaaS", "Productivity", "DevTools", "Design", "Marketing", "Crypto", "Social", "Analytics", "Utilities"];

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const PublishForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const { toast } = useToast();
  const { user } = useAuth();
  
  const iconInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState("");
  const [caption, setCaption] = useState("");
  const [about, setAbout] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [platform, setPlatform] = useState("web");
  const [urls, setUrls] = useState({ web: "", android: "", ios: "", github: "", demo: "" });
  const [pricing, setPricing] = useState("free");
  
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);
  
  const [updateNotes, setUpdateNotes] = useState("");
  const [isSubmitting, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && editId) {
      const fetchAppData = async () => {
        const { data, error } = await supabase
          .from("apps")
          .select("*")
          .eq("id", editId)
          .maybeSingle();
        
        if (error || !data) {
          toast({ title: "Error", description: "Could not find app to edit", variant: "destructive" });
          navigate("/account");
          return;
        }

        if (user && data.user_id !== user.id) {
          toast({ title: "Unauthorized", description: "You don't own this app", variant: "destructive" });
          navigate("/account");
          return;
        }

        setAppName(data.app_name);
        setCaption(data.caption || "");
        setAbout(data.full_description || "");
        setTechStack(data.tech_stack || []);
        setTags(data.tags || []);
        setPlatform((data.platforms?.[0] as string) || "web");
        setUrls({
          web: data.website_url || "",
          android: data.play_store_url || "",
          ios: data.app_store_url || "",
          github: data.github_url || "",
          demo: data.demo_video_url || ""
        });
        setPricing(data.pricing || "free");
        setIconPreview(data.app_icon_url);
        setScreenshotPreviews(data.screenshots || []);
        setLoading(false);
      };
      fetchAppData();
    }
  }, [editId, isEditMode, navigate, toast, user]);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - screenshotPreviews.length;
    if (remaining <= 0) return;
    const toAdd = files.slice(0, remaining);
    setScreenshotFiles(prev => [...prev, ...toAdd]);
    setScreenshotPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  };

  const validate = () => {
    const newErrors: string[] = [];
    if (!iconFile && !iconPreview) newErrors.push("icon");
    if (!appName.trim()) newErrors.push("name");
    if (!caption.trim()) newErrors.push("caption");
    if (!about.trim()) newErrors.push("about");
    if (techStack.length === 0) newErrors.push("tech");
    if (tags.length === 0) newErrors.push("tags");
    if (!platform) newErrors.push("platform");
    if (isEditMode && !updateNotes.trim()) newErrors.push("notes");
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast({ title: "Check required fields", description: "Your masterpiece needs a few more details.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Prepare data
      const appData = {
        app_name: appName,
        slug: slugify(appName),
        caption,
        full_description: about,
        tech_stack: techStack,
        tags,
        platforms: [platform],
        website_url: urls.web || null,
        play_store_url: urls.android || null,
        app_store_url: urls.ios || null,
        github_url: urls.github || null,
        demo_video_url: urls.demo || null,
        pricing,
        app_icon_url: iconPreview, // In a real app, upload file first
        screenshots: screenshotPreviews, // In a real app, upload files first
        user_id: user.id,
        status: "published"
      };

      let finalAppId = editId;

      if (isEditMode && editId) {
        // Update existing app
        const { error: updateError } = await supabase
          .from("apps")
          .update(appData)
          .eq("id", editId);
        
        if (updateError) throw updateError;

        // Save update history (Work Note)
        const { error: historyError } = await (supabase as any)
          .from("app_updates")
          .insert({
            app_id: editId,
            user_id: user.id,
            version_notes: updateNotes
          });
        
        if (historyError) throw historyError;

        toast({ title: "App Updated Successfully! ✨", description: "Changes have been live." });
      } else {
        // Create new app
        const { data, error: insertError } = await supabase
          .from("apps")
          .insert(appData)
          .select("id")
          .single();
        
        if (insertError) throw insertError;
        finalAppId = data.id;

        toast({ title: "App Published Successfully! 🚀", description: "The world is ready for your creation." });
      }

      navigate(`/app/${finalAppId}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast({ title: "Launch failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 h-16 flex items-center shadow-sm">
          <div className="container mx-auto max-w-6xl px-6 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-black text-muted-foreground hover:text-primary transition-all group uppercase tracking-widest">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back
            </button>
            <div className="flex items-center gap-4">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all active:scale-95">
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : isEditMode ? "Save Update" : "Launch App"}
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            
            {/* PRIMARY COLUMN */}
            <div className="space-y-8">
              <div className="space-y-1">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1] text-foreground">
                  {isEditMode ? "Refine your" : "Ship your"} <br /> <span className="text-primary italic">{isEditMode ? "craft." : "masterpiece."}</span>
                </h1>
              </div>

              {/* 0. Update Notes (WORK NOTE) - ONLY IN EDIT MODE */}
              {isEditMode && (
                <section className="space-y-4 bg-primary/5 border border-primary/20 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="flex items-center gap-2">
                    <History size={14} className="text-primary" />
                    <Label className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Work Note (What's New?)</Label>
                  </div>
                  <Textarea 
                    value={updateNotes}
                    onChange={e => setUpdateNotes(e.target.value)}
                    placeholder="Briefly describe what you updated in this version. e.g. Added dark mode, fixed navigation bugs..."
                    className={cn(
                      "min-h-[100px] rounded-[1.25rem] bg-background border-border/40 focus:ring-primary/20 p-5 text-sm font-medium",
                      errors.includes("notes") && "border-destructive ring-1 ring-destructive/20"
                    )}
                  />
                  <p className="text-[10px] text-muted-foreground/60 font-medium italic">Users will see this in the Update History tab.</p>
                </section>
              )}

              {/* 1. App Identity Top Row */}
              <section className="flex flex-col sm:flex-row gap-6 items-start bg-card border border-border/40 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 group-hover:scale-175 transition-transform duration-700">
                  <Rocket size={100} className="text-primary fill-primary" />
                </div>

                <button
                  onClick={() => iconInputRef.current?.click()}
                  className={cn(
                    "w-28 h-24 sm:w-36 sm:h-36 rounded-[1.5rem] border-4 border-dashed flex flex-col items-center justify-center gap-2 bg-background transition-all group shrink-0 overflow-hidden shadow-inner relative z-10",
                    errors.includes("icon") ? "border-destructive bg-destructive/5" : "border-border/60 hover:border-primary/40"
                  )}
                >
                  {iconPreview ? (
                    <img src={iconPreview} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="p-2 rounded-xl bg-surface group-hover:bg-primary/10 transition-colors">
                        <Upload size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Icon</span>
                    </>
                  )}
                </button>
                <input ref={iconInputRef} type="file" className="hidden" accept="image/*" onChange={handleIconChange} />

                <div className="flex-1 w-full flex flex-col gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">App Name</Label>
                    <Input 
                      placeholder="e.g. Vibe-Check AI"
                      value={appName}
                      onChange={e => setAppName(e.target.value)}
                      className={cn(
                        "h-12 rounded-xl text-lg font-black bg-background border-border/40 focus:ring-primary/20 transition-all px-5 placeholder:text-muted-foreground/30",
                        errors.includes("name") && "border-destructive ring-1 ring-destructive/20"
                      )}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">The Vibe (Caption)</Label>
                    <div className="relative">
                      <Input 
                        placeholder="In one sentence, why is this cool?"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        className={cn(
                          "h-12 rounded-xl bg-background border-border/40 focus:ring-primary/20 transition-all px-5 pr-12 text-sm font-bold placeholder:text-muted-foreground/30",
                          errors.includes("caption") && "border-destructive ring-1 ring-destructive/20"
                        )}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-foreground text-background text-xs font-bold rounded-xl p-3 max-w-[240px] shadow-2xl">
                          This caption appears directly on the app card in the global feed. Make it snappy!
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </section>

              {/* 2. About Section */}
              <section className="space-y-4 bg-card border border-border/40 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-2">
                    <Pencil size={14} className="text-primary" />
                    <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">The Backstory</Label>
                  </div>
                  <button 
                    onClick={() => setShowMarkdown(!showMarkdown)}
                    className={cn("p-1.5 rounded-lg transition-all border", showMarkdown ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border/40 hover:text-primary hover:border-primary/40")}
                  >
                    <Bold size={12} />
                  </button>
                </div>
                
                <div className={cn("bg-background border rounded-[1.25rem] transition-all overflow-hidden relative z-10 shadow-inner", errors.includes("about") ? "border-destructive ring-1 ring-destructive/20" : "border-border/40")}>
                  {showMarkdown && (
                    <div className="flex items-center gap-1 p-2 border-b border-border/40 bg-surface/50 backdrop-blur-sm">
                      {[Bold, Italic, Underline, List].map((Icon, i) => (
                        <button key={i} className="p-1.5 hover:bg-background border border-transparent hover:border-border/40 rounded-lg transition-all text-muted-foreground hover:text-primary"><Icon size={12} /></button>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Textarea 
                      value={about}
                      onChange={e => setAbout(e.target.value)}
                      placeholder="Describe the magic behind your app. What problem does it solve? What's the tech stack?"
                      className={cn(
                        "border-0 focus-visible:ring-0 rounded-none bg-transparent min-h-[140px] p-5 leading-relaxed text-sm font-medium placeholder:text-muted-foreground/30",
                        !aboutExpanded && "line-clamp-4 overflow-hidden h-[140px]"
                      )}
                    />
                    {!aboutExpanded && about.length > 200 && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent flex items-end justify-center pb-3">
                        <button onClick={() => setAboutExpanded(true)} className="text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:underline bg-background px-3 py-1 rounded-full border border-border/40 shadow-sm">Expand Story</button>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 3. Gallery */}
              <section className="space-y-4 bg-card border border-border/40 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <div className="flex items-center gap-2">
                  <ImagePlus size={14} className="text-primary" />
                  <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Visual Showcase (max 3)</Label>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {screenshotPreviews.map((src, i) => (
                    <div key={i} className="relative group w-56 aspect-video rounded-xl overflow-hidden border border-border/40 bg-background shrink-0 shadow-lg">
                      <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button 
                          onClick={() => {
                            setScreenshotFiles(prev => prev.filter((_, idx) => idx !== i));
                            setScreenshotPreviews(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="p-2 bg-destructive text-destructive-foreground rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {screenshotPreviews.length < 3 && (
                    <button 
                      onClick={() => screenshotInputRef.current?.click()}
                      className="w-56 aspect-video rounded-xl border-4 border-dashed border-border/60 hover:border-primary/40 bg-background flex flex-col items-center justify-center gap-2 group transition-all shrink-0 shadow-inner"
                    >
                      <div className="p-2 rounded-xl bg-surface group-hover:bg-primary/10 transition-colors">
                        <ImagePlus size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Add View</span>
                    </button>
                  )}
                </div>
                <input ref={screenshotInputRef} type="file" className="hidden" multiple accept="image/*" onChange={handleScreenshotChange} />
              </section>

              {/* 4. Taxonomy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border/40 p-6 rounded-[2rem] shadow-xl">
                  <TaxonomyField 
                    label="Tech Stack" 
                    options={TECH_OPTIONS} 
                    selected={techStack} 
                    onChange={setTechStack} 
                    error={errors.includes("tech")}
                  />
                </div>
                <div className="bg-card border border-border/40 p-6 rounded-[2rem] shadow-xl">
                  <TaxonomyField 
                    label="Tags" 
                    options={TAG_OPTIONS} 
                    selected={tags} 
                    onChange={setTags} 
                    error={errors.includes("tags")}
                  />
                </div>
              </div>
            </div>

            {/* SECONDARY COLUMN (Sidebar) */}
            <aside className="space-y-8 lg:sticky lg:top-24">
              {/* Platform Dropdown */}
              <section className="bg-card border border-border/40 p-6 rounded-[2rem] shadow-xl space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Rocket size={12} className="text-primary" />
                  </div>
                  <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform</Label>
                </div>
                
                <div className="space-y-4">
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className={cn(
                      "h-12 rounded-xl bg-background border-border/40 focus:ring-primary/20 px-4 font-bold text-xs",
                      errors.includes("platform") && "border-destructive"
                    )}>
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border shadow-2xl p-1 bg-card">
                      <SelectItem value="web" className="rounded-lg py-2.5 cursor-pointer">
                        <div className="flex items-center gap-3 font-bold text-xs">
                          <img src="/world-wide-web.png" className="w-5 h-5 object-contain" alt="" /> Web App
                        </div>
                      </SelectItem>
                      <SelectItem value="android" className="rounded-lg py-2.5 cursor-pointer">
                        <div className="flex items-center gap-3 font-bold text-xs">
                          <img src="/android.png" className="w-5 h-5 object-contain" alt="" /> Android
                        </div>
                      </SelectItem>
                      <SelectItem value="ios" className="rounded-lg py-2.5 cursor-pointer">
                        <div className="flex items-center gap-3 font-bold text-xs">
                          <img src="/app-store.png" className="w-5 h-5 object-contain" alt="" /> iOS
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[8px] font-black text-primary uppercase tracking-[0.2em] mb-1.5 block ml-1">
                      {platform.toUpperCase()} URL
                    </Label>
                    <Input 
                      placeholder={`https://your-${platform}-app.com`}
                      value={urls[platform as keyof typeof urls] || ""}
                      onChange={e => setUrls({...urls, [platform]: e.target.value})}
                      className="h-10 rounded-xl bg-background border-border/40 focus:ring-primary/20 text-xs px-4 font-bold"
                    />
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section className="bg-card border border-border/40 p-6 rounded-[2rem] shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={14} className="text-primary" />
                  <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Monetization</Label>
                </div>
                <Select value={pricing} onValueChange={setPricing}>
                  <SelectTrigger className="h-11 rounded-xl bg-background border-border/40 focus:ring-primary/20 px-4 font-black text-xs uppercase tracking-widest">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border shadow-2xl p-1 bg-card">
                    <SelectItem value="free" className="rounded-lg py-2 cursor-pointer text-xs">
                      <div className="flex items-center gap-3 font-bold"><Gift size={14} className="text-emerald-500" /> FREE</div>
                    </SelectItem>
                    <SelectItem value="paid" className="rounded-lg py-2 cursor-pointer text-xs">
                      <div className="flex items-center gap-3 font-bold"><CircleDollarSign size={14} className="text-amber-500" /> PAID</div>
                    </SelectItem>
                    <SelectItem value="freemium" className="rounded-lg py-2 cursor-pointer text-xs">
                      <div className="flex items-center gap-3 font-bold"><CreditCard size={14} className="text-primary" /> FREEMIUM</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </section>

              {/* Others */}
              <section className="bg-card border border-border/40 p-6 rounded-[2rem] shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Github size={14} className="text-primary" />
                  <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Social Links</Label>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="GitHub Repo"
                      value={urls.github}
                      onChange={e => setUrls({...urls, github: e.target.value})}
                      className="h-10 rounded-xl bg-background border-border/40 pl-10 text-[11px] font-bold"
                    />
                  </div>
                  <div className="relative group">
                    <Play size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Demo Video"
                      value={urls.demo}
                      onChange={e => setUrls({...urls, demo: e.target.value})}
                      className="h-10 rounded-xl bg-background border-border/40 pl-10 text-[11px] font-bold"
                    />
                  </div>
                </div>
              </section>
            </aside>

          </div>
        </main>
      </div>
    </TooltipProvider>
  );
};

const TaxonomyField = ({ label, options, selected, onChange, error }: any) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o: string) => 
    o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  );

  const canAddCustom = search.trim().length > 0 && !options.some((o: string) => o.toLowerCase() === search.toLowerCase()) && !selected.some((s: string) => s.toLowerCase() === search.toLowerCase());

  const addOption = (opt: string) => {
    onChange([...selected, opt]);
    setSearch("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Plus size={14} className="text-primary" />
          <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</Label>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className={cn(
              "p-1.5 rounded-lg border transition-all hover:scale-110 active:scale-95 shadow-sm",
              error ? "border-destructive bg-destructive/10 text-destructive" : "border-border/40 bg-background hover:text-primary hover:border-primary/40"
            )}>
              <Plus size={14} strokeWidth={3} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 rounded-[1.5rem] border-border shadow-2xl p-4 space-y-3 bg-card backdrop-blur-xl">
            <div className="relative">
              <Eye size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder={`Search or add...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 rounded-xl text-xs pl-9 bg-background border-border/40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAddCustom) {
                    addOption(search.trim());
                  }
                }}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-hide">
              {filtered.map((o: string) => (
                <button 
                  key={o}
                  onClick={() => addOption(o)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:text-primary transition-all flex items-center justify-between group"
                  >
                  {o}
                  <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  ))}
                  {canAddCustom && (
                  <button 
                  onClick={() => addOption(search.trim())}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-primary hover:font-bold transition-all flex items-center justify-between group"
                  >
                  Add "{search}"
                  <Plus size={10} />
                  </button>

              )}
              {filtered.length === 0 && !canAddCustom && <p className="text-[9px] text-muted-foreground p-3 text-center font-bold italic">No results found</p>}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-background/50 rounded-xl border border-dashed border-border/60">
        {selected.map((item: string) => (
          <div key={item} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest animate-in zoom-in-95 group shadow-sm">
            {item}
            <button onClick={() => onChange(selected.filter((i: string) => i !== item))} className="hover:text-destructive transition-colors">
              <X size={12} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
            </button>
          </div>
        ))}
        {selected.length === 0 && <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest pl-1 mt-1.5">Select or add...</p>}
      </div>
    </div>
  );
};

const Label = ({ children, className }: any) => (
  <h3 className={className}>{children}</h3>
);

export default PublishForm;
