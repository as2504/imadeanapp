import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeedNavbar from "@/components/feed/FeedNavbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Lightbulb, Upload, X } from "lucide-react";

const PLATFORMS = [
  { id: "web", label: "Web" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
];

const LAUNCH_OPTIONS = ["This month", "This quarter", "Later this year", "TBD"];

const PostIdea = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const iconRef = useRef<HTMLInputElement>(null);

  const [appName, setAppName] = useState("");
  const [caption, setCaption] = useState("");
  const [about, setAbout] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["web"]);
  const [plannedLaunch, setPlannedLaunch] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const togglePlatform = (id: string) => {
    setPlatforms((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast({ title: "Icon too large", description: "Please use an image under 500KB.", variant: "destructive" }); return; }
    setIconFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIconPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!appName.trim() || !caption.trim() || !about.trim()) {
      toast({ title: "Missing details", description: "Name, tagline and about are required.", variant: "destructive" });
      return;
    }
    if (platforms.length === 0) {
      toast({ title: "Pick a platform", description: "Choose at least one planned platform.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    let iconUrl: string | null = null;
    if (iconFile) {
      const ext = iconFile.name.split(".").pop();
      const path = `${user.id}/idea-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("app-assets").upload(path, iconFile);
      if (!upErr) {
        const { data: pub } = supabase.storage.from("app-assets").getPublicUrl(path);
        iconUrl = pub.publicUrl;
      }
    }

    const { data, error } = await supabase.from("apps").insert({
      user_id: user.id,
      app_name: appName.trim(),
      caption: caption.trim(),
      tagline: caption.trim(),
      full_description: about.trim(),
      platforms,
      planned_launch: plannedLaunch || null,
      app_icon_url: iconUrl,
      status: "upcoming",
    }).select("slug, id").maybeSingle();

    setSubmitting(false);

    if (error) {
      toast({ title: "Couldn't post idea", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Idea posted 💡", description: "Builders can now upvote and follow your idea." });
    navigate(`/upcoming/${data?.slug || data?.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Post an Idea — imadeanapp" description="Share an upcoming app idea and validate it with the community before you build." />
      <FeedNavbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Lightbulb size={20} className="text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Post an idea</h1>
          </div>
        </div>

        <div className="space-y-5 bg-card border border-border/40 rounded-2xl p-5 sm:p-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Idea name</label>
            <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="e.g. AI Recipe from Fridge" maxLength={60} className="h-11" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">One-liner</label>
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Snap your fridge, get tonight's dinner." maxLength={120} className="h-11" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About this idea</label>
            <Textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="What problem does it solve? Who is it for? Why now?" rows={5} maxLength={1000} />
            <p className="text-[10px] text-muted-foreground text-right">{about.length}/1000</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Icon (optional)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => iconRef.current?.click()}
                className="w-16 h-16 rounded-xl bg-secondary border border-dashed border-border flex items-center justify-center overflow-hidden shrink-0"
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={18} className="text-muted-foreground" />
                )}
              </button>
              {iconPreview && (
                <button onClick={() => { setIconPreview(null); setIconFile(null); }} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                  <X size={12} /> Remove
                </button>
              )}
              <input ref={iconRef} type="file" accept="image/*" hidden onChange={handleIconUpload} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Planned platforms</label>
            <div className="flex gap-2 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${platforms.includes(p.id) ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary border-border/40 text-muted-foreground"}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Planned launch</label>
            <div className="flex gap-2 flex-wrap">
              {LAUNCH_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPlannedLaunch(plannedLaunch === opt ? "" : opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${plannedLaunch === opt ? "bg-primary/10 border-primary/40 text-primary" : "bg-secondary border-border/40 text-muted-foreground"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border/40">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 rounded-xl">
              {submitting ? <Loader2 className="animate-spin" size={16} /> : "Post idea"}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Post as many ideas as you want. Convert them to published apps when you're ready to ship.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PostIdea;
