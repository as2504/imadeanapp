import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuestionDraft {
  id?: string;
  text: string;
  type: "single" | "multi";
  options: string[];
}

interface Props {
  open: boolean;
  mode: "create" | "edit";
  feedbackType: "qna" | "satisfaction";
  initial?: QuestionDraft;
  onClose: () => void;
  onCommit: (q: QuestionDraft) => void;
}

const SATISFACTION_OPTIONS = ["Great", "Good", "Okay", "Bad"];

const QuestionEditorDialog = ({ open, mode, feedbackType, initial, onClose, onCommit }: Props) => {
  const [text, setText] = useState("");
  const [type, setType] = useState<"single" | "multi">("single");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [errors, setErrors] = useState<{ question?: boolean; options?: boolean[] }>({});

  // Reset on open
  useEffect(() => {
    if (open) {
      setText(initial?.text ?? "");
      setType(initial?.type ?? "single");
      setOptions(
        initial?.options && initial.options.length >= 2
          ? [...initial.options]
          : ["", ""]
      );
      setErrors({});
    }
  }, [open, initial]);

  const isQna = feedbackType === "qna";

  const validate = (): boolean => {
    const errs: { question?: boolean; options?: boolean[] } = {};
    if (!text.trim()) errs.question = true;
    if (isQna) {
      const optErrs = options.map((o) => !o.trim());
      const validCount = options.filter((o) => o.trim()).length;
      if (validCount < 2) errs.options = optErrs;
    }
    if (errs.question || errs.options) {
      setErrors(errs);
      return false;
    }
    return true;
  };

  const handleCommit = () => {
    if (!validate()) return;
    onCommit({
      id: initial?.id,
      text: text.trim(),
      type: isQna ? type : "single",
      options: isQna ? options.filter((o) => o.trim()) : SATISFACTION_OPTIONS,
    });
  };

  const updateOption = (i: number, v: string) => {
    const next = [...options];
    next[i] = v;
    setOptions(next);
    if (errors.options?.[i]) {
      const e = [...(errors.options || [])];
      e[i] = false;
      setErrors({ ...errors, options: e });
    }
  };

  const addOption = () => {
    if (options.length >= 5) return;
    setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  };

  const isValid =
    text.trim().length > 0 &&
    (!isQna || options.filter((o) => o.trim()).length >= 2);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden border-border/40",
          // Mobile: near full-width, comfortable margins; Desktop: max-w-lg
          "max-w-[calc(100%-1rem)] sm:max-w-lg rounded-2xl"
        )}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-border/40">
          <DialogTitle className="text-base font-black tracking-tight">
            {mode === "edit" ? "Edit question" : "New question"}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
            {isQna
              ? "Write a question and at least 2 options."
              : "Write a question. Options are fixed (Great / Good / Okay / Bad)."}
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Type toggle (QnA only) */}
          {isQna && (
            <div className="inline-flex items-center p-1 rounded-full bg-secondary/60 border border-border/40">
              <button
                type="button"
                onClick={() => setType("single")}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-colors",
                  type === "single"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Single choice
              </button>
              <button
                type="button"
                onClick={() => setType("multi")}
                className={cn(
                  "px-3.5 py-1.5 text-[11px] font-bold rounded-full transition-colors",
                  type === "multi"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Multi choice
              </button>
            </div>
          )}

          {/* Question */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Question
            </Label>
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errors.question) setErrors({ ...errors, question: false });
              }}
              placeholder="e.g. How would you rate the speed?"
              className={cn(
                "rounded-xl h-11 bg-background border-border/50",
                errors.question && "border-destructive ring-1 ring-destructive/40"
              )}
              aria-invalid={!!errors.question}
              autoFocus
            />
            {errors.question && (
              <p className="text-[10px] font-medium text-destructive">Question required</p>
            )}
          </div>

          {/* Options (QnA only) */}
          {isQna && (
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Options
              </Label>
              <div className="space-y-2">
                {options.map((opt, i) => {
                  const optErr = !!errors.options?.[i];
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground/60 w-5 text-center">
                        {i + 1}
                      </span>
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className={cn(
                          "rounded-xl h-10 text-sm bg-background border-border/50 flex-1",
                          optErr && "border-destructive ring-1 ring-destructive/40"
                        )}
                        aria-invalid={optErr}
                      />
                      {options.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors p-1"
                          aria-label={`Remove option ${i + 1}`}
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <span className="w-6" />
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.options && (
                <p className="text-[10px] font-medium text-destructive">At least 2 options required</p>
              )}
              {options.length < 5 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary hover:opacity-80 mt-1"
                >
                  <Plus size={12} /> Add option
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-t border-border/40 bg-card/40">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCommit}
            aria-label="Save question"
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90",
              isValid
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
                : "bg-secondary text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            <Check size={18} strokeWidth={3} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionEditorDialog;
