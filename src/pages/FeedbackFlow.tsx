import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/feedback/QuestionCard";
import ThankYouScreen from "@/components/feedback/ThankYouScreen";
import { ChevronLeft, Lock, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "single" | "multi";
  options: string[];
}

const FeedbackFlow = () => {
  const { appId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTestMode = searchParams.get("test") === "true";

  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState("");
  const [config, setConfig] = useState<any>(null);
  const [publisherInfo, setPublisherInfo] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [followUpText, setFollowUpText] = useState("");
  const [animState, setAnimState] = useState<"entering" | "active" | "exiting">("entering");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [appId, user]);

  const fetchData = async () => {
    if (!appId) return;

    const { data: app } = await supabase.from("apps").select("app_name, user_id").eq("id", appId).maybeSingle();
    if (!app) { setLoading(false); return; }
    setAppName(app.app_name);
    setIsOwner(!!user && user.id === app.user_id);

    const { data: profile } = await supabase.from("profiles").select("display_name, username, avatar_url, user_id").eq("user_id", app.user_id).maybeSingle();
    setPublisherInfo(profile);

    if (user && !isTestMode) {
      const { data: tried } = await supabase.from("app_tries").select("id").eq("app_id", appId).eq("user_id", user.id).maybeSingle();
      setHasTried(!!tried);
    } else if (isTestMode) {
      setHasTried(true);
    }

    const { data: cfg } = await supabase
      .from("app_feedback_config" as any)
      .select("*")
      .eq("app_id", appId)
      .maybeSingle();
    setConfig(cfg);

    // Check if already submitted
    if (user && cfg && !isTestMode) {
      const { data: existing } = await supabase
        .from("app_feedback_responses")
        .select("id")
        .eq("config_id", (cfg as any).id)
        .eq("user_id", user.id)
        .maybeSingle();
      setAlreadySubmitted(!!existing);
    }

    setLoading(false);
  };

  const questions: Question[] = (config?.questions as any) || [];
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelect = (option: string) => {
    const q = currentQuestion;
    if (!q) return;

    if (q.type === "single") {
      setAnswers({ ...answers, [q.id]: option });
      const isSatisfactionBad = (config as any)?.feedback_type === "satisfaction" && option === "Bad";
      // Don't auto-advance on last question or satisfaction bad
      if (!isSatisfactionBad && !isLastQuestion) {
        setTimeout(() => advanceToNext({ ...answers, [q.id]: option }), 400);
      }
    } else {
      const current = (answers[q.id] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setAnswers({ ...answers, [q.id]: updated });
    }
  };

  const advanceToNext = async (currentAnswers?: Record<string, string | string[]>) => {
    const finalAnswers = currentAnswers || answers;
    if (currentIndex < questions.length - 1) {
      setAnimState("exiting");
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setAnimState("entering");
        setTimeout(() => setAnimState("active"), 500);
      }, 400);
    } else {
      // Show submitting animation
      setSubmitting(true);

      if (!isTestMode && user && config) {
        // Double-check for duplicate before inserting
        const { data: existingCheck } = await supabase
          .from("app_feedback_responses")
          .select("id")
          .eq("config_id", (config as any).id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingCheck) {
          const responseData: any = { answers: finalAnswers };
          if (followUpText.trim()) responseData.followUp = followUpText.trim();

          await supabase.from("app_feedback_responses" as any).insert({
            app_id: appId,
            config_id: (config as any).id,
            user_id: user.id,
            response_data: responseData,
            feedback_type: (config as any).feedback_type,
          } as any);
        }
      }

      // Brief animation delay
      setTimeout(() => {
        setSubmitting(false);
        setCompleted(true);
      }, 1500);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setAnimState("exiting");
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setAnimState("entering");
        setTimeout(() => setAnimState("active"), 500);
      }, 400);
    }
  };

  useEffect(() => {
    if (!loading && questions.length > 0) {
      setTimeout(() => setAnimState("active"), 500);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!config || !(config as any).is_enabled) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-foreground font-bold">Feedback is not available for this app.</p>
        <Button variant="ghost" onClick={() => navigate(`/app/${appId}`)}>Go Back</Button>
      </div>
    );
  }

  if (!hasTried && !isTestMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Lock size={32} className="text-muted-foreground" />
        <h2 className="text-lg font-bold text-foreground">Try the app first</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          You need to try this app before you can submit feedback.
        </p>
        <Button variant="ghost" onClick={() => navigate(`/app/${appId}`)}>
          Go to App
        </Button>
      </div>
    );
  }

  // Already submitted guard
  if (alreadySubmitted && !isTestMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Feedback Already Submitted</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            You've already shared your feedback for this app. Thank you!
          </p>
        </div>
        <Button onClick={() => navigate(`/app/${appId}`, { replace: true })} className="rounded-2xl font-bold">
          Back to App
        </Button>
      </div>
    );
  }

  // Submitting animation
  if (submitting) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-center animate-in fade-in duration-500">
          <p className="text-lg font-bold text-foreground mb-1">Submitting your feedback</p>
          <p className="text-sm text-muted-foreground">Just a moment...</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-background px-4 pt-20">
        <ThankYouScreen
          appId={appId || ""}
          publisherId={publisherInfo?.user_id || ""}
          publisherName={publisherInfo?.display_name || publisherInfo?.username || "Developer"}
          publisherAvatar={publisherInfo?.avatar_url}
          isTestMode={isTestMode}
          isOwner={isOwner}
        />
      </div>
    );
  }

  const selectedAnswers = currentQuestion
    ? Array.isArray(answers[currentQuestion.id])
      ? (answers[currentQuestion.id] as string[])
      : answers[currentQuestion.id]
        ? [answers[currentQuestion.id] as string]
        : []
    : [];

  // Determine if we should show the submit button at the bottom
  const showSubmitButton = isLastQuestion && selectedAnswers.length > 0;
  const isSatisfactionBad = (config as any)?.feedback_type === "satisfaction" && selectedAnswers.includes("Bad");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-navbar/95 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => (currentIndex > 0 ? goBack() : navigate(`/app/${appId}`, { replace: true }))}
            className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ChevronLeft size={18} /> {currentIndex > 0 ? "Back" : "Close"}
          </button>
          <h1 className="text-xs font-black uppercase tracking-widest text-muted-foreground truncate max-w-[50%]">
            {appName}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex gap-1.5 mb-2">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i <= currentIndex ? "bg-primary" : "bg-border/30"
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Question */}
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            feedbackType={(config as any).feedback_type}
            selectedAnswers={selectedAnswers}
            followUpText={followUpText}
            onSelect={handleSelect}
            onFollowUp={setFollowUpText}
            onNext={() => advanceToNext()}
            animationState={animState}
            isLastQuestion={isLastQuestion}
          />
        )}
      </div>

      {/* Submit / Next button for satisfaction bad or last question */}
      {isSatisfactionBad && (
        <div className="max-w-lg mx-auto px-4 pb-8">
          <Button
            onClick={() => advanceToNext()}
            className="w-full rounded-2xl h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {isLastQuestion ? "Submit" : "Next"}
          </Button>
        </div>
      )}

      {/* Submit button on last question for single-select (non-satisfaction-bad) */}
      {isLastQuestion && !isSatisfactionBad && currentQuestion?.type === "single" && selectedAnswers.length > 0 && (
        <div className="max-w-lg mx-auto px-4 pb-8">
          <Button
            onClick={() => advanceToNext()}
            className="w-full rounded-2xl h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            Submit
          </Button>
        </div>
      )}

      {isTestMode && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-muted rounded-full">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Test Mode</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackFlow;
