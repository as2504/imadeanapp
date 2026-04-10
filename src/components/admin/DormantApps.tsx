import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, MousePointerClick } from "lucide-react";

interface DormantApp {
  id: string;
  app_name: string;
  app_icon_url: string | null;
  avgRating: number;
  clicks: number;
  views_count: number | null;
}

interface DormantAppsProps {
  apps: DormantApp[];
  loading: boolean;
}

const DormantApps = ({ apps, loading }: DormantAppsProps) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base flex items-center gap-2">
        Dormant High-Quality Apps
        <Badge variant="secondary">{apps.length}</Badge>
      </CardTitle>
      <p className="text-xs text-muted-foreground">High ratings (≥4.0) but low visibility (&lt;10 clicks)</p>
    </CardHeader>
    <CardContent>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : apps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No dormant quality apps found</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              {app.app_icon_url ? (
                <img src={app.app_icon_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {app.app_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{app.app_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3" />{app.avgRating.toFixed(1)}</span>
                  <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{app.clicks} clicks</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{app.views_count || 0} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export default DormantApps;
