import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const EmptyFeed = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-16 px-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-surface flex items-center justify-center mb-4">
        <Rocket size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        No apps yet
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
        Be the first to share a vibe-coded app with the community.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button size="sm" className="rounded-full text-xs" onClick={() => navigate("/publish")}>
          Publish an App
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full text-xs"
          onClick={() => navigate("/trending")}
        >
          Explore Tags
        </Button>
      </div>
    </div>
  );
};

export default EmptyFeed;
