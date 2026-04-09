import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import PublicNavbar from "@/components/layout/PublicNavbar";
import AppDetailHeader from "@/components/app-detail/AppDetailHeader";

import AppDetailScreenshots from "@/components/app-detail/AppDetailScreenshots";
import AppDetailStats from "@/components/app-detail/AppDetailStats";
import AppDetailDescription from "@/components/app-detail/AppDetailDescription";
import AppFeedback from "@/components/app-detail/AppFeedback";
import AppDetailReviews from "@/components/app-detail/AppDetailReviews";
import AppUpdateHistory from "@/components/app-detail/AppUpdateHistory";
import RelatedApps from "@/components/app-detail/RelatedApps";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronDown, ChevronsUpDown, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const platformConfig: Record<string, { label: string; icon: string }> = {
  web: { label: "Web App", icon: "/webapp.png" },
  android: { label: "Android", icon: "/android.png" },
  ios: { label: "iOS", icon: "/app-store.png" },
};

const AppDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userTried, setUserTried] = useState(false);
  const [userReviewed, setUserReviewed] = useState(false);
  const [activeTab, setActiveTab] = useState<"Overview" | "Reviews" | "Updates" | "Feedback">("Overview");

  const isAuthenticated = !!user;
  const visibleTabs = isAuthenticated
    ? (["Overview", "Reviews", "Updates", "Feedback"] as const)
    : (["Overview"] as const);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      if (!appData || (appData.id !== id && appData.slug !== id)) setLoading(true);

      let query = supabase.from("apps").select("*");
      if (isUUID(id)) query = query.eq("id", id);
      else query = query.eq("slug", id);

      const { data: app, error } = await query.maybeSingle();
      if (error || !app) { setAppData(null); setLoading(false); return; }

      await (supabase as any).rpc('increment_views', { app_id: app.id });

      const { data: profile } = await supabase.from("profiles").select("display_name, username, user_id").eq("user_id", app.user_id).maybeSingle();
      const { data: ratings } = await supabase.from("ratings").select("rating, user_id").eq("app_id", app.id);
      const ratingsArr = ratings || [];
      const avg = ratingsArr.length > 0 ? ratingsArr.reduce((sum, r) => sum + r.rating, 0) / ratingsArr.length : 0;
      setAvgRating(Math.round(avg * 10) / 10);
      setTotalRatings(ratingsArr.length);

      if (user) {
        const { data: tries } = await supabase.from("app_tries").select("id").eq("app_id", app.id).eq("user_id", user.id).maybeSingle();
        setUserTried(!!tries);
        const hasReviewed = ratingsArr.some(r => r.user_id === user.id);
        setUserReviewed(hasReviewed);
      }

      // Update document title for browser tab
      document.title = `${app.app_name} — imadeanapp`;

      setAppData({
        id: app.id, slug: app.slug, name: app.app_name,
        publisher: profile?.display_name || profile?.username || "Unknown",
        publisherUserId: app.user_id,
        icon: app.app_icon_url || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=128",
        views: (app.views_count || 0) + 1, version: "1.0.0",
        publishedDate: new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUpdated: new Date(app.updated_at).toLocaleDateString(),
        pricing: app.pricing || "free", platforms: app.platforms || ["web"],
        tags: app.tags || [],
        description: app.full_description || app.tagline || "No description provided.",
        whatsNew: "Initial launch!",
        screenshots: app.screenshots || [],
        websiteUrl: app.website_url, appStoreUrl: app.app_store_url, playStoreUrl: app.play_store_url,
      });
      setLoading(false);
    };
    fetchApp();
    return () => { document.title = "imadeanapp – Discover & Publish AI-Crafted Apps"; };
  }, [id, user]);

  const handleTryApp = async (url?: string) => {
    if (user && appData) {
      if (!userTried) {
        await supabase.from("app_tries").insert({ app_id: appData.id, user_id: user.id });
        setUserTried(true);
      }
      // Track unique outbound click for trending algorithm
      await supabase.from("app_clicks" as any).upsert(
        { app_id: appData.id, user_id: user.id },
        { onConflict: "app_id,user_id" }
      );
    }
    if (!appData) return;
    const finalUrl = url || appData.websiteUrl || appData.appStoreUrl || appData.playStoreUrl;
    if (finalUrl) window.open(finalUrl, "_blank");
  };

  const handleRateClick = () => {
    if (!isAuthenticated) return;
    setActiveTab("Reviews");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !appData) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (!appData) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold text-foreground">App not found</h2>
      <button onClick={() => navigate("/")} className="text-primary text-sm hover:underline">Go back home</button>
    </div>
  );

  const availableLinks = [
    { type: 'web', url: appData.websiteUrl },
    { type: 'android', url: appData.playStoreUrl },
    { type: 'ios', url: appData.appStoreUrl },
  ].filter(link => !!link.url);

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated ? <FeedNavbar /> : <PublicNavbar />}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft size={16} /> Back
        </button>

        <AppDetailHeader app={appData} avgRating={avgRating} totalRatings={totalRatings} isAuthenticated={isAuthenticated} />

        <div className="mt-6">
          {availableLinks.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  Try App <ChevronDown size={18} className="transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 p-1.5 rounded-xl border-border/40 bg-popover/95 backdrop-blur-xl shadow-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 py-1.5 mb-1">Select Platform</p>
                {availableLinks.map((link) => {
                  const config = platformConfig[link.type];
                  return (
                    <DropdownMenuItem 
                      key={link.type} 
                      onClick={() => handleTryApp(link.url)}
                      className="rounded-lg py-1.5 gap-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-background border border-border/40 flex items-center justify-center p-1">
                        <img src={config.icon} alt={config.label} className="w-full h-full object-contain dark:invert" />
                      </div>
                      <span className="text-xs font-bold tracking-tight">{config.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => handleTryApp()}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
            >
              Try App
            </button>
          )}
        </div>

        {/* Tabs — normal on ≥300px, dropdown on <300px */}
        <div className="mt-8 border-b border-border/40">
          {/* Wide: inline tabs */}
          <div className="hidden min-[300px]:flex items-center gap-1">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  tab === "Feedback"
                    ? activeTab === tab
                      ? "text-amber-500"
                      : "text-amber-400/70 hover:text-amber-500"
                    : activeTab === tab
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={tab === "Feedback" ? "flex items-center gap-1" : ""}>
                  {tab === "Feedback" && <span className="text-[10px]">✦</span>}
                  {tab}
                </span>
                {activeTab === tab && (
                  <span className={`absolute bottom-0 left-1 right-1 h-0.5 rounded-full ${
                    tab === "Feedback" ? "bg-amber-500" : "bg-primary"
                  }`} />
                )}
              </button>
            ))}
          </div>
          {/* Narrow (<300px): dropdown */}
          <div className="flex min-[300px]:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-foreground">
                  {activeTab} <ChevronsUpDown size={14} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px] p-1 rounded-xl border-border/40 bg-card shadow-xl">
                {visibleTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`rounded-lg px-3 py-2 cursor-pointer text-xs font-medium ${
                      tab === "Feedback"
                        ? "text-amber-500 bg-amber-500/5 font-bold"
                        : activeTab === tab
                          ? "text-primary bg-primary/5"
                          : ""
                    }`}
                  >
                    {tab === "Feedback" && <span className="mr-1">✦</span>}
                    {tab}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mt-6">
          <div>
            {activeTab === "Overview" && (
              <div className="space-y-8">
                <AppDetailScreenshots screenshots={appData.screenshots} />
                <AppDetailStats tags={appData.tags} platforms={appData.platforms} pricing={appData.pricing} />
                <AppDetailDescription
                  description={appData.description}
                  userTried={userTried}
                  userReviewed={userReviewed}
                  onRateClick={isAuthenticated ? handleRateClick : undefined}
                  isAuthenticated={isAuthenticated}
                />
                <AppFeedback appId={appData.id} userTried={userTried} />
              </div>
            )}
            {activeTab === "Reviews" && isAuthenticated && <AppDetailReviews appId={appData.id} userTried={userTried} />}
            {activeTab === "Updates" && isAuthenticated && <AppUpdateHistory appId={appData.id} />}
            {activeTab === "Feedback" && isAuthenticated && (
              <div className="py-4">
                {appData.publisherUserId === user?.id ? (
                  <section className="p-6 rounded-2xl bg-card border border-border/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto">
                      <MessageSquare size={22} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-foreground">You can't give feedback to your own app</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Check how others feel about your app in <span className="font-semibold text-foreground">Settings → App Feedback</span>.
                    </p>
                    <button
                      onClick={() => navigate("/settings")}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Go to Settings
                    </button>
                  </section>
                ) : !userTried ? (
                  <section className="p-6 rounded-2xl bg-card border border-border/40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                      <ChevronLeft size={22} className="text-primary rotate-180" />
                    </div>
                    <p className="text-sm font-bold text-foreground">Try the app first</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      You need to try this app before you can share feedback.
                    </p>
                  </section>
                ) : (
                  <AppFeedback appId={appData.id} userTried={userTried} />
                )}
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <RelatedApps currentId={appData.id} currentTags={appData.tags} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AppDetail;
