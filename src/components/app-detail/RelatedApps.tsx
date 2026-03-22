import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface RelatedApp {
  id: string;
  app_name: string;
  tagline: string | null;
  app_icon_url: string | null;
}

const RelatedApps = ({ currentAppId, tags }: { currentAppId: string; tags: string[] }) => {
  const [apps, setApps] = useState<RelatedApp[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRelated = async () => {
      if (!tags.length) return;
      const { data } = await supabase
        .from("apps")
        .select("id, app_name, tagline, app_icon_url")
        .eq("status", "published")
        .neq("id", currentAppId)
        .overlaps("tags", tags)
        .limit(3);
      if (data) setApps(data);
    };
    fetchRelated();
  }, [currentAppId, tags]);

  if (!apps.length) return null;

  return (
    <section className="py-6">
      <h2 className="text-sm font-semibold text-foreground mb-4">You may also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {apps.map((a) => (
          <button
            key={a.id}
            onClick={() => navigate(`/app/${a.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface/50 hover:bg-surface transition-colors text-left active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-lg shrink-0 overflow-hidden">
              {a.app_icon_url ? (
                <img src={a.app_icon_url} alt={a.app_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground/40">📦</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.app_name}</p>
              {a.tagline && <p className="text-xs text-muted-foreground truncate">{a.tagline}</p>}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default RelatedApps;
