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

const AppDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data: app, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !app) {
        console.error("Error fetching app:", error);
        setAppData(null);
      } else {
        // Fetch publisher info
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", app.user_id)
          .single();

        setAppData({
          id: app.id,
          name: app.app_name,
          publisher: profile?.display_name || profile?.username || "Unknown",
          icon: app.app_icon_url || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=128",
          rating: 4.8, // Mocked for now
          reviews: "1.2K", // Mocked
          views: app.views_count || 0,
          version: "1.0.0", // Mocked
          lastUpdated: new Date(app.updated_at).toLocaleDateString(),
          pricing: "Free",
          platforms: app.platforms || ["web"],
          tags: app.tags || [],
          description: app.description || app.tagline || "No description provided.",
          whatsNew: "Initial launch!",
          screenshots: app.screenshot_urls || [
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
          ]
        });
      }
      setLoading(false);
    };

    fetchApp();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">App not found</h2>
        <button onClick={() => navigate("/home")} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
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

        <div className="bg-card rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-border/40">
          <div className="space-y-12">
            {/* 1. Header Section */}
            <AppDetailHeader app={appData} />

            {/* 2. Gallery Section */}
            <AppDetailScreenshots screenshots={appData.screenshots} />

            {/* 3. Quick Info (Metadata Chips) */}
            <AppDetailStats 
              tags={appData.tags} 
              platforms={appData.platforms} 
              pricing={appData.pricing} 
            />

            {/* 4. About & Version Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
              <div className="lg:col-span-2 space-y-12">
                <AppDetailDescription 
                  description={appData.description} 
                  whatsNew={appData.whatsNew}
                  lastUpdated={appData.lastUpdated}
                />
                
                {/* 5. Trust & Social */}
                <AppDetailComments appId={appData.id} userTried={true} />
              </div>

              {/* Sidebar / Related */}
              <aside className="space-y-8">
                <RelatedApps currentId={appData.id} />
              </aside>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDetail;
