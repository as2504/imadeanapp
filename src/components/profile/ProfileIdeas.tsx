import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getTimeAgo } from "@/lib/utils";
import IdeaCard, { type UpcomingApp } from "@/components/upcoming/IdeaCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";

const ProfileIdeas = ({ profileUserId }: { profileUserId?: string }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<UpcomingApp[]>([]);
  const [loading, setLoading] = useState(true);

  const targetUserId = profileUserId || user?.id;
  const isOwn = !profileUserId || profileUserId === user?.id;

  useEffect(() => {
    if (!targetUserId) return;
    const load = async () => {
      setLoading(true);
      const { data: apps } = await supabase
        .from("apps")
        .select("id, slug, app_name, app_icon_url, caption, tagline, tags, platforms, upvotes_count, notify_count, comments_count, planned_launch, user_id, created_at")
        .eq("user_id", targetUserId)
        .eq("status", "upcoming")
        .order("upvotes_count", { ascending: false });

      const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("user_id", targetUserId).maybeSingle();
      const publisherName = profile?.display_name || profile?.username || "User";

      const mapped: UpcomingApp[] = (apps || []).map((a: any) => ({
        id: a.id, slug: a.slug || undefined,
        appName: a.app_name, appIcon: a.app_icon_url || "💡",
        caption: a.caption || a.tagline || "",
        tags: a.tags || [], platforms: a.platforms || [],
        upvotesCount: a.upvotes_count || 0, notifyCount: a.notify_count || 0,
        commentsCount: a.comments_count || 0, plannedLaunch: a.planned_launch,
        publisherName, publisherUserId: a.user_id, timeAgo: getTimeAgo(a.created_at),
      }));
      setIdeas(mapped);
      setLoading(false);
    };
    load();
  }, [targetUserId]);

  if (loading) return <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  if (ideas.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-card border border-border/40 rounded-2xl">
        <Lightbulb size={32} className="mx-auto text-amber-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground mb-2">{isOwn ? "Got an idea?" : "No ideas yet"}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {isOwn ? "Validate your next app before you build it. Post your idea and watch the upvotes roll in." : "This creator hasn't posted any upcoming ideas yet."}
        </p>
        {isOwn && <Button onClick={() => navigate("/post-idea")} className="rounded-xl">Post your first idea</Button>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
      {ideas.map((i) => <IdeaCard key={i.id} idea={i} />)}
    </div>
  );
};

export default ProfileIdeas;
