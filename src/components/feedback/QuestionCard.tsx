import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight } from "lucide-react";

interface QuestionCardProps {
  question: {
    id: string;
    text: string;
    type: "single" | "multi";
    options: string[];
  };
  feedbackType: "qna" | "satisfaction";
  selectedAnswers: string[];
  followUpText?: string;
  onSelect: (option: string) => void;
  onFollowUp?: (text: string) => void;
  onNext?: () => void;
  animationState: "entering" | "active" | "exiting";
}

const QuestionCard = ({
  question,
  feedbackType,
  selectedAnswers,
  followUpText = "",
  onSelect,
  onFollowUp,
  onNext,
  animationState,
}: QuestionCardProps) => {
  const isSatisfaction = feedbackType === "satisfaction";
  const showBadFollowUp = isSatisfaction && selectedAnswers.includes("Bad");

  const satisfactionEmojis: Record<string, string> = {
    Great: "🤩",
    Good: "😊",
    Okay: "😐",
    Bad: "😞",
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto transition-all duration-500 ease-out",
        animationState === "entering" && "animate-in fade-in slide-in-from-bottom-4 duration-500",
        animationState === "exiting" && "animate-out fade-out slide-out-to-top-8 duration-400",
        animationState === "active" && "opacity-100"
      )}
    >
      <div className="bg-card border border-border/40 rounded-3xl p-8 shadow-xl shadow-black/5">
        <p className="text-lg font-bold text-foreground leading-snug mb-8 text-center">
          {question.text}
        </p>

        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswers.includes(option);
            return (
              <button
                key={option}
                onClick={() => onSelect(option)}
                className={cn(
                  "w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-200 text-left group",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-md shadow-primary/10"
                    : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <span className="flex items-center gap-3">
                  {isSatisfaction && satisfactionEmojis[option] && (
                    <span className="text-2xl">{satisfactionEmojis[option]}</span>
                  )}
                  <span className="font-semibold text-sm">{option}</span>
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {showBadFollowUp && (
          <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              What's the #1 thing we should fix?
            </p>
            <Textarea
              value={followUpText}
              onChange={(e) => onFollowUp?.(e.target.value)}
              placeholder="Tell us what went wrong..."
              className="min-h-[80px] bg-background/50 border-border/40 rounded-xl resize-none text-sm"
            />
          </div>
        )}

        {question.type === "multi" && selectedAnswers.length > 0 && (
          <Button
            onClick={onNext}
            className="w-full mt-6 rounded-2xl h-12 font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            Next <ChevronRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
