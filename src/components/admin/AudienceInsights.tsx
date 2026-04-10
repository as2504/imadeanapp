import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AudienceInsightsProps {
  newUsersThisWeek: number;
  totalUsers: number;
  returningUsers: number;
  activityByHour: number[];
}

const AudienceInsights = ({ newUsersThisWeek, totalUsers, returningUsers, activityByHour }: AudienceInsightsProps) => {
  const maxActivity = Math.max(...activityByHour, 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Audience Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xl font-bold text-foreground">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{newUsersThisWeek}</p>
            <p className="text-xs text-muted-foreground">New This Week</p>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{returningUsers}</p>
            <p className="text-xs text-muted-foreground">Returning</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">Activity by Hour (UTC)</p>
          <div className="flex items-end gap-0.5 h-16">
            {activityByHour.map((v, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/50 rounded-t-sm hover:bg-primary transition-colors"
                style={{ height: `${Math.max((v / maxActivity) * 100, 4)}%` }}
                title={`${i}:00 UTC — ${v} clicks`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudienceInsights;
