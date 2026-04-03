import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AppFeedbackProps {
  appId: string;
  userTried?: boolean;
}

const AppFeedback = ({ appId, userTried }: AppFeedbackProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [appId, user]);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from("app_feedback_config" as any)
        .select("id, is_enabled")
        .eq("app_id", appId)
        .maybeSingle();
      
      setConfig(data);

      // Check if user already submitted
      if (user && data) {
        const { data: existing } = await supabase
          .from("app_feedback_responses" as any)
          .select("id")
          .eq("config_id", (data as any).id)
          .eq("user_id", user.id)
          .maybeSingle();
        setAlreadySubmitted(!!existing);
      }
    } catch (error) {
      console.error("Error fetching feedback config:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only show if: authenticated, tried the app, config exists & enabled, not already submitted
  if (loading || !user || !userTried || !config || !(config as any).is_enabled || alreadySubmitted) return null;

  return (
    <section className="p-6 rounded-2xl bg-card border border-border/40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <MessageSquare size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Share your feedback</p>
            <p className="text-[10px] text-muted-foreground">Help the developer improve this app</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/feedback/${appId}`)}
          size="sm"
          className="rounded-xl font-bold text-xs px-5 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          Give Feedback
        </Button>
      </div>
    </section>
  );
};

export default AppFeedback;
