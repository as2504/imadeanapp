import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import AppDetailHeader from "@/components/app-detail/AppDetailHeader";
import AppDetailScreenshots from "@/components/app-detail/AppDetailScreenshots";
import AppDetailStats from "@/components/app-detail/AppDetailStats";
import AppDetailDescription from "@/components/app-detail/AppDetailDescription";
import AppDetailComments from "@/components/app-detail/AppDetailComments";
import RelatedApps from "@/components/app-detail/RelatedApps";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

const AppDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userTried, setUserTried] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      setLoading(true);

      // Detect UUID vs slug
      let query = supabase.from("apps").select("*");
      if (isUUID(id)) {
        query = query.eq("id", id);
      } else {
        query = query.eq("slug", id);
      }

      const { data: app, error } = await query.maybeSingle();

      if (error || !app) {
        console.error("Error fetching app:", error);
        setAppData(null);
        setLoading(false);
        return;
      }

      // Fetch publisher info
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, username, user_id")
        .eq("user_id", app.user_id)
        .maybeSingle();

      // Fetch ratings
      const { data: ratings } = await supabase
        .from("ratings")
        .select("rating")
        .eq("app_id", app.id);

      const ratingsArr = ratings || [];
      const avg = ratingsArr.length > 0
        ? ratingsArr.reduce((sum, r) => sum + r.rating, 0) / ratingsArr.length
        : 0;
      setAvgRating(Math.round(avg * 10) / 10);
      setTotalRatings(ratingsArr.length);

      // Check if user tried
      if (user) {
        const { data: tries } = await supabase
          .from("app_tries")
          .select("id")
          .eq("app_id", app.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setUserTried(!!tries);
      }

      setAppData({
        id: app.id,
        slug: app.slug,
        name: app.app_name,
        publisher: profile?.display_name || profile?.username || "Unknown",
        publisherUserId: app.user_id,
        icon: app.app_icon_url || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=128",
        views: app.views_count || 0,
        version: "1.0.0",
        lastUpdated: new Date(app.updated_at).toLocaleDateString(),
        pricing: app.pricing || "free",
        platforms: app.platforms || ["web"],
        tags: app.tags || [],
        description: app.full_description || app.tagline || "No description provided.",
        whatsNew: "Initial launch!",
        screenshots: app.screenshots || [
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        ],
        websiteUrl: app.website_url,
        appStoreUrl: app.app_store_url,
        playStoreUrl: app.play_store_url,
      });
      setLoading(false);
    };

    fetchApp();
  }, [id, user]);

  const handleTryApp = async () => {
    if (!user || !appData) return;
    // Record try
    if (!userTried) {
      await supabase.from("app_tries").insert({
        app_id: appData.id,
        user_id: user.id,
      });
      setUserTried(true);
    }
    // Open the app URL
    const url = appData.websiteUrl || appData.appStoreUrl || appData.playStoreUrl;
    if (url) window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">App not found</h2>
        <button onClick={() => navigate("/home")} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] transition-colors duration-300">
      <FeedNavbar />

      <main className="container mx-auto max-w-5xl px-4 md:px-6 pt-24 pb-20">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ChevronLeft size={18} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Back</span>
          </button>
        </div>

        <div className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-border/40">
          <div className="space-y-12">
            <AppDetailHeader
              app={appData}
              avgRating={avgRating}
              totalRatings={totalRatings}
              onTryApp={handleTryApp}
            />

            <AppDetailScreenshots screenshots={appData.screenshots} />

            <AppDetailStats
              tags={appData.tags}
              platforms={appData.platforms}
              pricing={appData.pricing}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
              <div className="lg:col-span-2 space-y-12">
                <AppDetailDescription
                  description={appData.description}
                  whatsNew={appData.whatsNew}
                  lastUpdated={appData.lastUpdated}
                />

                <AppDetailComments appId={appData.id} userTried={userTried} />
              </div>

              <aside className="space-y-8">
                <RelatedApps currentId={appData.id} currentTags={appData.tags} />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDetail;
