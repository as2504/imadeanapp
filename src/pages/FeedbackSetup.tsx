import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { X, Plus, Trash2, Sparkles, TestTube, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // New question form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionType, setNewQuestionType] = useState<"single" | "multi">("single");
  const [newOptions, setNewOptions] = useState<string[]>(["", ""]);

  // Editing existing question
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editType, setEditType] = useState<"single" | "multi">("single");
  const [editOptions, setEditOptions] = useState<string[]>([]);

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

  const startEditing = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
    setEditType(q.type);
    setEditOptions([...q.options]);
  };

  const saveEditing = () => {
    if (!editText.trim()) {
      toast.error("Question text is required");
      return;
    }
    const validOpts = feedbackType === "satisfaction" ? SATISFACTION_OPTIONS : editOptions.filter(o => o.trim());
    if (feedbackType !== "satisfaction" && validOpts.length < 2) {
      toast.error("At least 2 options required");
      return;
    }
    setQuestions(questions.map(q =>
      q.id === editingId ? { ...q, text: editText.trim(), type: feedbackType === "satisfaction" ? "single" : editType, options: validOpts } : q
    ));
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleAddQuestion = () => {
    if (questions.length >= 5) {
      toast.error("Maximum 5 questions allowed");
      return;
    }
    if (!newQuestionText.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (feedbackType === "qna") {
      const validOptions = newOptions.filter((o) => o.trim());
      if (validOptions.length < 2) {
        toast.error("Add at least 2 options");
        return;
      }
      const q: Question = {
        id: `q-${Date.now()}`,
        text: newQuestionText.trim(),
        type: newQuestionType,
        options: validOptions,
      };
      setQuestions([...questions, q]);
    } else {
      const q: Question = {
        id: `q-${Date.now()}`,
        text: newQuestionText.trim(),
        type: "single",
        options: SATISFACTION_OPTIONS,
      };
      setQuestions([...questions, q]);
    }
    setNewQuestionText("");
    setNewOptions(["", ""]);
    setNewQuestionType("single");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addOptionField = () => {
    if (newOptions.length >= 5) return;
    setNewOptions([...newOptions, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const removeOption = (index: number) => {
    if (newOptions.length <= 2) return;
    setNewOptions(newOptions.filter((_, i) => i !== index));
  };

  const addEditOptionField = () => {
    if (editOptions.length >= 5) return;
    setEditOptions([...editOptions, ""]);
  };

  const updateEditOption = (index: number, value: string) => {
    const updated = [...editOptions];
    updated[index] = value;
    setEditOptions(updated);
  };

  const removeEditOption = (index: number) => {
    if (editOptions.length <= 2) return;
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  const handleDone = async () => {
    if (!user || !appId) return;

    const finalQuestions = questions;
    if (finalQuestions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setSaving(true);
    const payload = {
      app_id: appId,
      user_id: user.id,
      feedback_type: feedbackType,
      is_enabled: true,
      questions: finalQuestions,
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

        {/* Existing questions */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Questions ({questions.length}/5)
              </Label>
              {questions.length < 5 && !showAddForm && !editingId && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-card border border-border/40 rounded-2xl p-4 group/q">
                {editingId === q.id ? (
                  /* Inline edit mode */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Q{idx + 1}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">Editing</span>
                    </div>
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="rounded-xl bg-background/50 border-border/40"
                      placeholder="Question text..."
                    />
                    {feedbackType === "qna" && (
                      <>
                        <div className="flex items-center gap-3">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Multi-choice</Label>
                          <Switch
                            checked={editType === "multi"}
                            onCheckedChange={(c) => setEditType(c ? "multi" : "single")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Options</Label>
                          {editOptions.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => updateEditOption(i, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                className="rounded-xl bg-background/50 border-border/40 flex-1 h-9 text-sm"
                              />
                              {editOptions.length > 2 && (
                                <button onClick={() => removeEditOption(i)} className="text-muted-foreground/40 hover:text-destructive">
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {editOptions.length < 5 && (
                            <button
                              onClick={addEditOptionField}
                              className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-80"
                            >
                              <Plus size={12} /> Add Option
                            </button>
                          )}
                        </div>
                      </>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={saveEditing} className="rounded-xl h-8 text-xs font-bold gap-1">
                        <Check size={12} /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEditing} className="rounded-xl h-8 text-xs font-bold">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Q{idx + 1}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-bold uppercase">
                          {q.type === "single" ? "Single" : "Multi"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{q.text}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {q.options.map((o) => (
                          <span key={o} className={`px-2.5 py-1 rounded-lg bg-background text-[11px] font-medium border border-border/30 ${feedbackType === "satisfaction" ? satisfactionColors[o] || "text-muted-foreground" : "text-muted-foreground"}`}>
                            {feedbackType === "satisfaction" && satisfactionIcons[o] ? `${satisfactionIcons[o]} ` : ""}{o}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(q)}
                        className="text-muted-foreground/40 hover:text-primary transition-colors p-1 opacity-0 group-hover/q:opacity-100"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 opacity-0 group-hover/q:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new question form — collapsible */}
          {showAddForm && questions.length < 5 && (
            <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">New Question</p>
                </div>
                <button onClick={() => { setShowAddForm(false); setNewQuestionText(""); setNewOptions(["", ""]); }} className="text-muted-foreground/60 hover:text-foreground">
                  <X size={16} />
                </button>
              </div>

              <Input
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter your question..."
                className="rounded-xl bg-background/50 border-border/40"
                autoFocus
              />

              {feedbackType === "qna" && (
                <>
                  <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Multi-choice</Label>
                    <Switch
                      checked={newQuestionType === "multi"}
                      onCheckedChange={(c) => setNewQuestionType(c ? "multi" : "single")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Options</Label>
                    {newOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="rounded-xl bg-background/50 border-border/40 flex-1 h-9 text-sm"
                        />
                        {newOptions.length > 2 && (
                          <button onClick={() => removeOption(i)} className="text-muted-foreground/40 hover:text-destructive">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {newOptions.length < 5 && (
                      <button
                        onClick={addOptionField}
                        className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:opacity-80"
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    )}
                  </div>
                </>
              )}

              {feedbackType === "satisfaction" && (
                <p className="text-[10px] text-muted-foreground italic">
                  Options will be: Great, Good, Okay, Bad (fixed for satisfaction type)
                </p>
              )}

              <Button onClick={handleAddQuestion} variant="secondary" className="w-full rounded-xl h-10 font-bold text-xs">
                <Plus size={14} className="mr-1" /> Add Question
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center italic">
            Maximum 5 questions allowed.
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
    </div>
  );
};

export default FeedbackSetup;
