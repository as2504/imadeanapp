import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConversionFunnelProps {
  impressions: number;
  clicks: number;
  feedback: number;
}

const ConversionFunnel = ({ impressions, clicks, feedback }: ConversionFunnelProps) => {
  const stages = [
    { label: "Impressions", value: impressions, color: "bg-primary/20" },
    { label: "Clicks", value: clicks, color: "bg-primary/40" },
    { label: "Feedback", value: feedback, color: "bg-primary/70" },
  ];

  const max = Math.max(impressions, 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((s) => (
          <div key={s.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-medium text-foreground">{s.value.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full ${s.color} transition-all`}
                style={{ width: `${Math.max((s.value / max) * 100, 2)}%` }}
              />
            </div>
          </div>
        ))}
        {impressions > 0 && (
          <p className="text-xs text-muted-foreground pt-2">
            Click rate: {((clicks / impressions) * 100).toFixed(1)}% · Feedback rate: {((feedback / Math.max(clicks, 1)) * 100).toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversionFunnel;
