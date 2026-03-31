import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AppFeedbackProps {
  appId: string;
}

const AppFeedback = ({ appId }: AppFeedbackProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<{ is_enabled: boolean; feedback_type: string } | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, [appId]);

  const fetchConfig = async () => {
    try {
      const { data } = await supabase
        .from("app_feedback_config" as any)
        .select("is_enabled, feedback_type")
        .eq("app_id", appId)
        .maybeSingle();
      
      setConfig(data);
    } catch (error) {
      console.error("Error fetching feedback config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !feedback.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("app_feedback_responses" as any)
        .insert({
          app_id: appId,
          user_id: user.id,
          response_data: { text: feedback.trim() },
          feedback_type: config?.feedback_type || "text"
        });

      if (error) throw error;

      setSubmitted(true);
      setFeedback("");
      toast({ title: "Feedback sent", description: "Thanks for your feedback!" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send feedback", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !config?.is_enabled) return null;

  return (
    <section className="p-8 rounded-[2rem] bg-surface border border-border/40 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <MessageSquare size={20} />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-foreground uppercase tracking-tight leading-none">Developer Feedback</h3>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Share your thoughts directly with the creator</p>
        </div>
      </div>

      <div className="relative">
        <Textarea 
          placeholder="How can we improve this app? What features are you looking for?"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[120px] bg-background/50 border-border/40 rounded-2xl p-4 text-sm focus:ring-primary/20 resize-none leading-relaxed"
          disabled={submitted}
        />
        <div className="absolute bottom-4 right-4">
          <Button 
            onClick={handleSubmit} 
            disabled={!feedback.trim() || isSubmitting || submitted}
            className="rounded-full px-6 bg-primary hover:bg-primary/90 font-black uppercase tracking-widest text-[10px] h-9 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={14} />
            ) : submitted ? (
              <><CheckCircle2 size={14} className="mr-2" /> Sent</>
            ) : (
              <><Send size={12} className="mr-2" /> Submit Feedback</>
            )}
          </Button>
        </div>
      </div>

      {submitted && (
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1">
          Your response has been delivered to the developer.
        </p>
      )}
    </section>
  );
};

export default AppFeedback;
