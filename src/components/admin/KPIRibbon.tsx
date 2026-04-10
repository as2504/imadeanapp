import { Card, CardContent } from "@/components/ui/card";
import { AppWindow, MessageSquare, UserPlus, MousePointerClick } from "lucide-react";

interface KPIRibbonProps {
  totalApps: number;
  totalFeedback: number;
  newSignups24h: number;
  totalClicks: number;
}

const metrics = [
  { key: "totalApps", label: "Published Apps", icon: AppWindow },
  { key: "totalFeedback", label: "Feedback Submissions", icon: MessageSquare },
  { key: "newSignups24h", label: "New Signups (24h)", icon: UserPlus },
  { key: "totalClicks", label: "Total Clicks", icon: MousePointerClick },
] as const;

const KPIRibbon = (props: KPIRibbonProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {metrics.map(({ key, label, icon: Icon }) => (
      <Card key={key}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{props[key].toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default KPIRibbon;
