import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, BarChart3 } from "lucide-react";

interface FeedbackDashboardProps {
  appId: string;
  appName: string;
  onBack: () => void;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
}

const FeedbackDashboard = ({ appId, appName, onBack }: FeedbackDashboardProps) => {
  const [config, setConfig] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [appId]);

  const fetchData = async () => {
    const { data: cfg } = await supabase
      .from("app_feedback_config" as any)
      .select("*")
      .eq("app_id", appId)
      .maybeSingle();

    if (cfg) {
      setConfig(cfg);
      const { data: resp } = await supabase
        .from("app_feedback_responses" as any)
        .select("*")
        .eq("config_id", (cfg as any).id);
      setResponses((resp as any[]) || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const questions: Question[] = (config?.questions as any) || [];
  const totalResponses = responses.length;

  const getOptionPercentage = (questionId: string, option: string) => {
    if (totalResponses === 0) return 0;
    const count = responses.filter((r) => {
      const data = (r as any).response_data as any;
      const answers = data?.answers;
      if (!answers) return false;
      const answer = answers[questionId];
      if (Array.isArray(answer)) return answer.includes(option);
      return answer === option;
    }).length;
    return Math.round((count / totalResponses) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h3 className="text-sm font-bold text-foreground">{appName}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            {totalResponses} response{totalResponses !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No questions configured.</p>
      ) : (
        <div className="space-y-6">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-background/50 border border-border/40 rounded-2xl p-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Question {idx + 1}
              </p>
              <p className="text-sm font-bold text-foreground mb-4">{q.text}</p>
              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const pct = getOptionPercentage(q.id, opt);
                  return (
                    <div key={opt} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{opt}</span>
                        <span className="font-bold text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackDashboard;
