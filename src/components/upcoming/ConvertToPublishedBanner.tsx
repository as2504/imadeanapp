import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface Props {
  appId: string;
  upvotes: number;
  notifyCount: number;
}

const ConvertToPublishedBanner = ({ appId, upvotes, notifyCount }: Props) => {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Rocket size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-foreground">Ready to launch?</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {notifyCount > 0
            ? `${notifyCount} ${notifyCount === 1 ? "person is" : "people are"} waiting to be notified the moment this goes live.`
            : "Convert this idea into a full published app. Your upvotes and comments come along."}
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => navigate(`/publish?edit=${appId}&from=upcoming`)}
        className="rounded-xl shrink-0"
      >
        Convert to published
      </Button>
    </div>
  );
};

export default ConvertToPublishedBanner;
