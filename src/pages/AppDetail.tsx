import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
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
import { ChevronLeft } from "lucide-react";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const tabs = ["Overview", "Reviews", "Updates"] as const;
type Tab = (typeof tabs)[number];

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
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

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
  }, [id, user]);

  const handleTryApp = async () => {
    if (!user || !appData) return;
    if (!userTried) {
      await supabase.from("app_tries").insert({ app_id: appData.id, user_id: user.id });
      setUserTried(true);
    }
    const url = appData.websiteUrl || appData.appStoreUrl || appData.playStoreUrl;
    if (url) window.open(url, "_blank");
  };

  const handleRateClick = () => {
    setActiveTab("Reviews");
    // Optionally scroll to top or specific section
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
      <button onClick={() => navigate("/home")} className="text-primary text-sm hover:underline">Go back home</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft size={16} /> Back
        </button>

        <AppDetailHeader app={appData} avgRating={avgRating} totalRatings={totalRatings} />

        {/* Action Row */}
        <div className="mt-6">
          <button 
            onClick={handleTryApp} 
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Try App
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-8 border-b border-border/40">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
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
                  onRateClick={handleRateClick}
                />
              </div>
            )}
            {activeTab === "Reviews" && <AppDetailReviews appId={appData.id} userTried={userTried} />}
            {activeTab === "Updates" && <AppUpdateHistory appId={appData.id} />}
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
