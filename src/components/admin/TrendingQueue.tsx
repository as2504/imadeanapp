import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface TrendingApp {
  app_id: string;
  app_name?: string;
  trending_score: number;
  engagement_score: number;
  avg_rating: number;
  tries_count: number;
  saves_count: number;
  reviews_count: number;
}

interface TrendingQueueProps {
  apps: TrendingApp[];
  loading: boolean;
}

const TrendingQueue = ({ apps, loading }: TrendingQueueProps) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <TrendingUp className="h-5 w-5 text-primary" />
      <h3 className="font-semibold text-foreground">Trending Queue</h3>
      <Badge variant="secondary">{apps.length} apps</Badge>
    </div>

    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>App</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Engagement</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Tries</TableHead>
            <TableHead className="text-right">Saves</TableHead>
            <TableHead className="text-right">Reviews</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
            </TableRow>
          ) : (
            apps.map((app, i) => (
              <TableRow key={app.app_id}>
                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{app.app_name || app.app_id.slice(0, 8)}</TableCell>
                <TableCell className="text-right font-mono">{app.trending_score.toFixed(2)}</TableCell>
                <TableCell className="text-right font-mono">{app.engagement_score.toFixed(0)}</TableCell>
                <TableCell className="text-right">{app.avg_rating ? app.avg_rating.toFixed(1) : "—"}</TableCell>
                <TableCell className="text-right">{app.tries_count}</TableCell>
                <TableCell className="text-right">{app.saves_count}</TableCell>
                <TableCell className="text-right">{app.reviews_count}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  </div>
);

export default TrendingQueue;
