import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import FeedNavbar from "@/components/feed/FeedNavbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  MessageSquare, 
  Settings as SettingsIcon,
  Shield,
  Bell,
  Loader2,
  Check,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [activeSection, setActiveSection] = useState("general");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [feedbackConfig, setFeedbackConfig] = useState({
    enabled: true,
    type: "text"
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyApps();
    }
  }, [user]);

  const fetchMyApps = async () => {
    setLoadingApps(true);
    const { data } = await supabase
      .from("apps")
      .select("id, app_name, slug")
      .eq("user_id", user?.id)
      .eq("status", "published");
    setMyApps(data || []);
    setLoadingApps(false);
  };

  const fetchFeedbackConfig = async (appId: string) => {
    const { data } = await supabase
      .from("app_feedback_config" as any)
      .select("*")
      .eq("app_id", appId)
      .maybeSingle();
    
    if (data) {
      const cfg = data as any;
      setFeedbackConfig({
        enabled: cfg.is_enabled,
        type: cfg.feedback_type
      });
    } else {
      setFeedbackConfig({ enabled: true, type: "text" });
    }
  };

  const handleAppSelect = (appId: string) => {
    setSelectedApp(appId);
    fetchFeedbackConfig(appId);
  };

  const saveFeedbackSettings = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    
    const { error } = await supabase
      .from("app_feedback_config" as any)
      .upsert({
        app_id: selectedApp,
        is_enabled: true,
        feedback_type: feedbackConfig.type,
        updated_at: new Date().toISOString()
      }, { onConflict: 'app_id' });

    setIsSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save feedback settings", variant: "destructive" });
    } else {
      toast({ title: "Settings saved", description: "Feedback form has been added to your app details page." });
    }
  };

  const sections = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "feedback", label: "App Feedback", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
  ];

  const activeSectionData = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 pt-20 pb-24">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="text-xl font-bold text-foreground tracking-tight mb-8">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Dropdown with Search */}
          <div className="lg:hidden mb-6">
            <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isDropdownOpen}
                  className="w-full justify-between h-12 rounded-2xl bg-card border-border/40 px-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <activeSectionData.icon size={18} className="text-primary" />
                    <span className="font-bold uppercase tracking-tight text-xs">
                      {activeSectionData.label}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-32px)] p-0 rounded-2xl border-border/40 bg-card overflow-hidden" align="start">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Search settings..." className="h-12 border-none focus:ring-0" />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No section found.</CommandEmpty>
                    <CommandGroup>
                      {sections.map((s) => (
                        <CommandItem
                          key={s.id}
                          value={s.label}
                          onSelect={() => {
                            setActiveSection(s.id);
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                        >
                          <s.icon size={16} className={cn(
                            activeSection === s.id ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-sm font-bold uppercase tracking-tight",
                            activeSection === s.id ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {s.label}
                          </span>
                          {activeSection === s.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Desktop Sidebar - Decreased width */}
          <div className="hidden lg:block lg:w-48 shrink-0">
            <div className="flex lg:flex-col gap-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    activeSection === s.id 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <s.icon size={16} className={activeSection === s.id ? "text-primary" : "text-muted-foreground"} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
              {/* Content Header with Save button on top right */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {activeSectionData.label}
                </h2>
                {activeSection === "feedback" && selectedApp && (
                  <button 
                    onClick={saveFeedbackSettings}
                    disabled={isSaving}
                    className="text-sm font-bold text-primary hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving && <Loader2 size={14} className="animate-spin" />}
                    Save Changes
                  </button>
                )}
              </div>

              <div className="p-6">
                {activeSection === "general" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-foreground">Theme Mode</p>
                        <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
                      </div>
                      <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border/40">
                        <button 
                          onClick={() => setTheme("light")}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            theme === "light" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Sun size={16} />
                        </button>
                        <button 
                          onClick={() => setTheme("dark")}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            theme === "dark" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Moon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "feedback" && (
                  <div className="space-y-5 animate-reveal">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">App Feedback Configuration</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A feedback button will be added to the app details page for your users to share their thoughts.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Select App</Label>
                        <Select onValueChange={handleAppSelect} value={selectedApp || undefined}>
                          <SelectTrigger className="h-10 bg-surface/30 border-border/40 rounded-xl text-sm font-medium focus:ring-primary/20 transition-all">
                            <SelectValue placeholder={loadingApps ? "Loading apps..." : "Choose a published app"} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border/40">
                            {myApps.map(app => (
                              <SelectItem key={app.id} value={app.id} className="rounded-lg my-0.5">
                                {app.app_name}
                              </SelectItem>
                            ))}
                            {myApps.length === 0 && !loadingApps && (
                              <p className="text-xs text-center py-4 text-muted-foreground">No published apps found</p>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedApp && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Feedback Type</Label>
                            <Select 
                              value={feedbackConfig.type} 
                              onValueChange={(val) => setFeedbackConfig(prev => ({ ...prev, type: val }))}
                            >
                              <SelectTrigger className="h-10 bg-surface/30 border-border/40 rounded-xl text-sm font-medium focus:ring-primary/20 transition-all">
                                <SelectValue placeholder="Select feedback style" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border/40">
                                <SelectItem value="text" className="rounded-lg my-0.5">
                                  <div className="flex flex-col py-0.5">
                                    <span className="text-sm font-medium">Open Text Feedback</span>
                                    <span className="text-[10px] text-muted-foreground">Phase 1: Simple comment box for users</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="satisfaction" disabled className="rounded-lg my-0.5 opacity-50">
                                  <div className="flex flex-col py-0.5">
                                    <span className="text-sm font-medium">Satisfaction Scale (Coming Soon)</span>
                                    <span className="text-[10px] text-muted-foreground">Phase 2: Great / Okay / Bad ratings</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="qna" disabled className="rounded-lg my-0.5 opacity-50">
                                  <div className="flex flex-col py-0.5">
                                    <span className="text-sm font-medium">Custom Q&A (Coming Soon)</span>
                                    <span className="text-[10px] text-muted-foreground">Phase 3: Multi-question custom forms</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(activeSection === "notifications" || activeSection === "privacy") && (
                  <div className="text-center py-12">
                    <p className="text-sm font-medium text-muted-foreground italic">
                      This section is currently under development.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
