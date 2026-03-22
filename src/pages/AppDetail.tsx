import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import AppDetailHeader from "@/components/app-detail/AppDetailHeader";
import AppDetailStats from "@/components/app-detail/AppDetailStats";
import AppDetailScreenshots from "@/components/app-detail/AppDetailScreenshots";
import AppDetailDescription from "@/components/app-detail/AppDetailDescription";
import AppDetailActions from "@/components/app-detail/AppDetailActions";
import AppDetailComments from "@/components/app-detail/AppDetailComments";
import RelatedApps from "@/components/app-detail/RelatedApps";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const AppDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Tables<"apps"> | null>(null);
  const [publisherName, setPublisherName] = useState("Unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase.from("apps").select("*").eq("id", id).single();
      if (data) {
        setApp(data);
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, username")
          .eq("user_id", data.user_id)
          .single();
        if (profile) setPublisherName(profile.display_name || profile.username || "Unknown");
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-5">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">App not found.</p>
      </div>
    );
  }

  const primaryUrl = app.website_url || app.play_store_url || app.app_store_url;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pb-24 sm:pb-10">
        <AppDetailHeader app={app} publisherName={publisherName} publisherUserId={app.user_id} />
        <AppDetailStats
          likes={app.likes_count || 0}
          comments={app.comments_count || 0}
          views={app.views_count || 0}
          publishedAt={app.created_at}
        />
        <AppDetailScreenshots screenshots={app.screenshots || []} />
        <AppDetailDescription
          description={app.full_description}
          techStack={app.tech_stack}
          platforms={app.platforms}
          pricing={app.pricing}
          githubUrl={app.github_url}
        />
        <AppDetailActions likes={app.likes_count || 0} />
        <AppDetailComments appId={app.id} />
        <RelatedApps currentAppId={app.id} tags={app.tags || []} />
      </div>

      {/* Mobile sticky CTA */}
      {primaryUrl && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border/40 sm:hidden">
          <Button className="w-full gap-2" size="lg" onClick={() => window.open(primaryUrl, "_blank")}>
            <ExternalLink size={16} />
            Try App
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppDetail;
