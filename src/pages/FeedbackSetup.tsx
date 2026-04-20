import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { X, Plus, Trash2, TestTube, Pencil } from "lucide-react";
import QuestionEditorDialog, { type QuestionDraft } from "@/components/feedback/QuestionEditorDialog";

interface Question {
  id: string;
  text: string;
  type: "single" | "multi";
  options: string[];
}

const SATISFACTION_OPTIONS = ["Great", "Good", "Okay", "Bad"];

const FeedbackSetup = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appName, setAppName] = useState("");
  const [feedbackType, setFeedbackType] = useState<"qna" | "satisfaction">("qna");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [saving, setSaving] = useState(false);
  const [existingConfigId, setExistingConfigId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppAndConfig();
  }, [appId]);

  const fetchAppAndConfig = async () => {
    if (!appId) return;
    const { data: app } = await supabase.from("apps").select("app_name").eq("id", appId).maybeSingle();
    if (app) setAppName(app.app_name);

    const { data: config } = await supabase
      .from("app_feedback_config" as any)
      .select("*")
      .eq("app_id", appId)
      .maybeSingle();

    if (config) {
      const cfg = config as any;
      setExistingConfigId(cfg.id);
      setFeedbackType(cfg.feedback_type);
      setQuestions((cfg.questions as Question[]) || []);
    }
  };

  const openCreate = () => {
    if (questions.length >= 10) {
      toast.error("Maximum 10 questions allowed");
      return;
    }
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (q: Question) => {
    setEditingId(q.id);
    setModalOpen(true);
  };

  const handleCommit = (draft: QuestionDraft) => {
    if (editingId) {
      setQuestions(questions.map((q) =>
        q.id === editingId
          ? { ...q, text: draft.text, type: draft.type, options: draft.options }
          : q
      ));
    } else {
      const q: Question = {
        id: `q-${Date.now()}`,
        text: draft.text,
        type: draft.type,
        options: draft.options,
      };
      setQuestions([...questions, q]);
    }
    setModalOpen(false);
    setEditingId(null);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleDone = async () => {
    if (!user || !appId) return;

    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setSaving(true);
    const payload = {
      app_id: appId,
      user_id: user.id,
      feedback_type: feedbackType,
      is_enabled: true,
      questions,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (existingConfigId) {
      const res = await supabase
        .from("app_feedback_config" as any)
        .update(payload as any)
        .eq("id", existingConfigId);
      error = res.error;
    } else {
      const res = await supabase
        .from("app_feedback_config" as any)
        .insert(payload as any);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      toast.error("Failed to save feedback form");
      return;
    }

    showConfetti();
    toast.success("Feedback form saved!");
    setTimeout(() => navigate("/settings", { replace: true }), 1500);
  };

  const showConfetti = () => {
    const container = document.createElement("div");
    container.className = "fixed inset-0 pointer-events-none z-[9999]";
    document.body.appendChild(container);
    const colors = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement("div");
      piece.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:${Math.random() > 0.5 ? "50%" : "2px"};
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%; top:-10px;
        animation: confetti-fall ${1.5 + Math.random()}s ease-out forwards;
        animation-delay: ${Math.random() * 0.3}s;
      `;
      container.appendChild(piece);
    }
    const style = document.createElement("style");
    style.textContent = `@keyframes confetti-fall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(${360 + Math.random() * 360}deg);opacity:0} }`;
    container.appendChild(style);
    setTimeout(() => container.remove(), 3000);
  };

  const satisfactionIcons: Record<string, string> = {
    Great: "✦",
    Good: "●",
    Okay: "◐",
    Bad: "✕",
  };

  const satisfactionColors: Record<string, string> = {
    Great: "text-emerald-500",
    Good: "text-sky-500",
    Okay: "text-amber-500",
    Bad: "text-rose-500",
  };

  const editingQuestion = editingId ? questions.find((q) => q.id === editingId) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-navbar/95 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
            <X size={18} /> Cancel
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest text-foreground">Feedback Setup</h1>
          <Button
            onClick={handleDone}
            disabled={saving}
            size="sm"
            className="rounded-xl font-bold text-xs px-5 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {saving ? "Saving..." : "Done"}
          </Button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Setting up feedback for</p>
          <h2 className="text-xl font-black text-foreground tracking-tight">{appName || "Loading..."}</h2>
        </div>

        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Select Type of Feedback</Label>
          <Select value={feedbackType} onValueChange={(v) => setFeedbackType(v as "qna" | "satisfaction")}>
            <SelectTrigger className="rounded-xl h-11 bg-card border-border/40 font-bold text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              <SelectItem value="qna" className="rounded-lg font-bold text-sm">Q&A — Custom questions & options</SelectItem>
              <SelectItem value="satisfaction" className="rounded-lg font-bold text-sm">Satisfaction — Custom questions, fixed scale</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {feedbackType === "satisfaction" && (
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Fixed options for all questions</p>
            <div className="flex gap-2 flex-wrap">
              {SATISFACTION_OPTIONS.map((o) => (
                <span key={o} className={`px-3 py-1.5 rounded-full bg-secondary text-xs font-bold flex items-center gap-1.5 ${satisfactionColors[o]}`}>
                  <span className="text-base leading-none">{satisfactionIcons[o]}</span> {o}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              If user selects "Bad", a follow-up text input will appear automatically.
            </p>
          </div>
        )}

        {/* Questions list */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Questions ({questions.length}/10)
              </Label>
              {questions.length < 10 && (
                <button
                  onClick={openCreate}
                  className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  aria-label="Add question"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            {questions.length === 0 ? (
              <button
                onClick={openCreate}
                className="w-full bg-card border border-dashed border-border/60 rounded-2xl py-10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Plus size={16} />
                </div>
                <p className="text-xs font-bold">Add your first question</p>
              </button>
            ) : (
              questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-card border border-border/40 rounded-2xl p-4 group/q animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Q{idx + 1}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-bold uppercase">
                          {q.type === "single" ? "Single" : "Multi"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground break-words">{q.text}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.options.map((o) => (
                          <span
                            key={o}
                            className={`px-2.5 py-1 rounded-lg bg-background text-[11px] font-medium border border-border/30 ${
                              feedbackType === "satisfaction"
                                ? satisfactionColors[o] || "text-muted-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {feedbackType === "satisfaction" && satisfactionIcons[o] ? `${satisfactionIcons[o]} ` : ""}
                            {o}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(q)}
                        className="text-muted-foreground/60 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-secondary/60"
                        aria-label="Edit question"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-muted-foreground/60 hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-secondary/60"
                        aria-label="Delete question"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-muted-foreground text-center italic">
            Maximum 10 questions allowed.
          </p>
        </div>

        {existingConfigId && (
          <div className="border-t border-border/40 pt-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/feedback/${appId}?test=true`)}
              className="w-full rounded-2xl h-12 font-bold text-sm gap-2 border-primary/30 text-primary hover:bg-primary/5"
            >
              <TestTube size={16} /> Test Feedback
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Preview the feedback flow without saving any responses.
            </p>
          </div>
        )}
      </main>

      <QuestionEditorDialog
        open={modalOpen}
        mode={editingId ? "edit" : "create"}
        feedbackType={feedbackType}
        initial={editingQuestion ? {
          id: editingQuestion.id,
          text: editingQuestion.text,
          type: editingQuestion.type,
          options: editingQuestion.options,
        } : undefined}
        onClose={() => { setModalOpen(false); setEditingId(null); }}
        onCommit={handleCommit}
      />
    </div>
  );
};

export default FeedbackSetup;
