import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import FeedNavbar from "@/components/feed/FeedNavbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FeedbackDashboard from "@/components/feedback/FeedbackDashboard";
import { 
  ChevronLeft, 
  Moon, 
  Sun, 
  MessageSquare, 
  Settings as SettingsIcon,
  BarChart3,
  Loader2,
  Check,
  ChevronDown,
  LogOut,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  FileText,
  ExternalLink,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  
  const [activeSection, setActiveSection] = useState("general");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [feedbackConfigs, setFeedbackConfigs] = useState<any[]>([]);
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [dashboardApp, setDashboardApp] = useState<{ id: string; name: string } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyApps();
      fetchFeedbackConfigs();
    }
  }, [user]);

  const fetchMyApps = async () => {
    setLoadingApps(true);
    const { data } = await supabase
      .from("apps")
      .select("id, app_name, slug, app_icon_url")
      .eq("user_id", user?.id)
      .eq("status", "published");
    setMyApps(data || []);
    setLoadingApps(false);
  };

  const fetchFeedbackConfigs = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("app_feedback_config" as any)
      .select("*")
      .eq("user_id", user.id);
    
    const configs = (data as any[]) || [];
    setFeedbackConfigs(configs);

    const counts: Record<string, number> = {};
    for (const cfg of configs) {
      const { count } = await supabase
        .from("app_feedback_responses" as any)
        .select("id", { count: "exact", head: true })
        .eq("config_id", cfg.id);
      counts[cfg.app_id] = count || 0;
    }
    setResponseCounts(counts);
  };

  const configuredAppIds = new Set(feedbackConfigs.map((c: any) => c.app_id));

  const handleAddApp = (appId: string) => {
    if (configuredAppIds.has(appId)) {
      toast.info("Feedback is already added for this app.");
      return;
    }
    setAddPopoverOpen(false);
    navigate(`/feedback-setup/${appId}`);
  };

  const sections = [
    { id: "general", label: "General", icon: SettingsIcon, badge: null },
    { id: "feedback", label: "App Feedback", icon: MessageSquare, badge: "Beta" },
    { id: "reviews", label: "App Analytics", icon: BarChart3, badge: "Beta" },
    { id: "legal", label: "Legal", icon: FileText, badge: null },
  ];

  const activeSectionData = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 pb-24">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h1 className="text-xl font-bold text-foreground tracking-tight mb-8">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Dropdown */}
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
                    {activeSectionData.badge && (
                      <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest">
                        {activeSectionData.badge}
                      </Badge>
                    )}
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
                          {s.badge && (
                            <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest">
                              {s.badge}
                            </Badge>
                          )}
                          {activeSection === s.id && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                      {/* Support in mobile dropdown */}
                      <CommandItem
                        value="Support"
                        onSelect={() => window.location.href = "mailto:contact@imadeanapp.com"}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      >
                        <Mail size={16} className="text-muted-foreground" />
                        <span className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Support</span>
                      </CommandItem>
                      {/* Log out in mobile dropdown */}
                      <CommandItem
                        value="Log out"
                        onSelect={() => setShowLogoutDialog(true)}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer text-destructive"
                      >
                        <LogOut size={16} />
                        <span className="text-sm font-bold uppercase tracking-tight">Log out</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-52 shrink-0">
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
                  <s.icon size={16} className={cn("shrink-0", activeSection === s.id ? "text-primary" : "text-muted-foreground")} />
                  <span className="flex-1 truncate text-left">{s.label}</span>
                  {s.badge && (
                    <Badge variant="secondary" className="shrink-0 text-[7px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest">
                      {s.badge}
                    </Badge>
                  )}
                </button>
              ))}

              {/* Support */}
              <div className="mt-4 pt-4 border-t border-border/40">
                <a
                  href="mailto:contact@imadeanapp.com"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all whitespace-nowrap w-full"
                >
                  <Mail size={16} />
                  Support
                </a>
              </div>

              {/* Log out always last */}
              <div className="mt-2 pt-2 border-t border-border/40">
                <button
                  onClick={() => setShowLogoutDialog(true)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-all whitespace-nowrap w-full"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  {activeSectionData.label}
                </h2>
                {activeSection === "feedback" && !dashboardApp && (
                  <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                    <PopoverTrigger asChild>
                      <button className="w-8 h-8 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors">
                        <Plus size={16} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-0 rounded-2xl border-border/40 bg-card overflow-hidden" align="end">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Search apps..." className="h-10 border-none focus:ring-0 text-sm" />
                        <CommandList className="max-h-[200px]">
                          <CommandEmpty>No apps found.</CommandEmpty>
                          <CommandGroup>
                            {myApps.map((app) => {
                              const hasConfig = configuredAppIds.has(app.id);
                              return (
                                <CommandItem
                                  key={app.id}
                                  value={app.app_name}
                                  onSelect={() => handleAddApp(app.id)}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 cursor-pointer",
                                    hasConfig && "opacity-50"
                                  )}
                                >
                                  <div className="w-7 h-7 rounded-lg bg-background border border-border/40 overflow-hidden flex-shrink-0">
                                    {app.app_icon_url && (
                                      <img src={app.app_icon_url} alt="" className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <span className="text-xs font-medium truncate">{app.app_name}</span>
                                  {hasConfig && <Check size={12} className="ml-auto text-primary" />}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="p-6">
                {activeSection === "legal" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <button
                        onClick={() => navigate("/terms")}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="space-y-0.5 text-left">
                          <p className="text-sm font-bold text-foreground">Terms & Conditions</p>
                          <p className="text-xs text-muted-foreground">Read our terms of service</p>
                        </div>
                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                      <button
                        onClick={() => navigate("/privacy")}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary/50 transition-colors group"
                      >
                        <div className="space-y-0.5 text-left">
                          <p className="text-sm font-bold text-foreground">Privacy Policy</p>
                          <p className="text-xs text-muted-foreground">Read our privacy policy</p>
                        </div>
                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    </div>
                    <div className="px-4 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        For any queries related to imadeanapp.com, please reach out to{" "}
                        <a href="mailto:contact@imadeanapp.com" className="text-primary hover:underline">
                          contact@imadeanapp.com
                        </a>
                      </p>
                    </div>
                  </div>
                )}

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
                  <div className="space-y-5 animate-in fade-in duration-300">
                    {dashboardApp ? (
                      <FeedbackDashboard
                        appId={dashboardApp.id}
                        appName={dashboardApp.name}
                        onBack={() => setDashboardApp(null)}
                      />
                    ) : (
                      <>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-foreground">Your Feedback Forms</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Manage feedback forms for your published apps. Click the + to add a new one.
                          </p>
                        </div>

                        {feedbackConfigs.length === 0 ? (
                          <div className="text-center py-12 space-y-3">
                            <MessageSquare size={32} className="mx-auto text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No feedback forms yet.</p>
                            <p className="text-xs text-muted-foreground/60">
                              Click the + button above to create one.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {feedbackConfigs.map((cfg: any) => {
                              const app = myApps.find((a) => a.id === cfg.app_id);
                              const count = responseCounts[cfg.app_id] || 0;
                              return (
                                <div
                                  key={cfg.id}
                                  className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                >
                                  <button
                                    onClick={() => setDashboardApp({ id: cfg.app_id, name: app?.app_name || "App" })}
                                    className="flex items-center gap-4 flex-1 min-w-0 text-left"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border/40 overflow-hidden flex-shrink-0">
                                      {app?.app_icon_url && (
                                        <img src={app.app_icon_url} alt="" className="w-full h-full object-cover" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-foreground truncate">
                                        {app?.app_name || "Unknown App"}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                                        {cfg.feedback_type === "qna" ? "Q&A" : "Satisfaction"}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-lg font-black text-foreground">{count}</p>
                                      <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                                        responses
                                      </p>
                                    </div>
                                  </button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex-shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <MoreVertical size={14} />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 rounded-2xl p-2 border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
                                      <DropdownMenuItem
                                        onClick={() => navigate(`/feedback-setup/${cfg.app_id}`)}
                                        className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider"
                                      >
                                        <Edit3 size={14} className="text-amber-500" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="my-1 opacity-50" />
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={async () => {
                                          const { error } = await supabase
                                            .from("app_feedback_config" as any)
                                            .delete()
                                            .eq("id", cfg.id);
                                          if (error) {
                                            toast.error("Failed to delete feedback config.");
                                          } else {
                                            toast.success("Feedback form deleted.");
                                            fetchFeedbackConfigs();
                                          }
                                        }}
                                        className="rounded-xl gap-3 py-2.5 px-3 cursor-pointer text-xs font-bold uppercase tracking-wider text-destructive focus:text-destructive"
                                      >
                                        <Trash2 size={14} /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeSection === "reviews" && (
                  <div className="text-center py-12">
                    <BarChart3 size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-bold text-foreground mb-1">App Analytics</p>
                    <p className="text-sm text-muted-foreground">
                      Here you will be able to see analytics for your published applications.
                    </p>
                    <Badge variant="secondary" className="mt-3 text-[10px] font-bold uppercase tracking-wider">Coming Soon</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-2xl border-border/40">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">Log out</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => signOut()} className="rounded-full bg-destructive hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
