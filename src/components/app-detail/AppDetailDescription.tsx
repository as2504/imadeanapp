import { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppDetailDescriptionProps {
  description: string;
  userTried: boolean;
  userReviewed: boolean;
  onRateClick?: () => void;
  isAuthenticated?: boolean;
}

const AppDetailDescription = ({ description, userTried, userReviewed, onRateClick, isAuthenticated = true }: AppDetailDescriptionProps) => {
  const [expanded, setExpanded] = useState(false);

  // Simple formatter to handle bold (**text**) and bullets (- text) without markdown chars
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let processed = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
        .replace(/^- (.*)/g, '<li class="ml-4 list-disc">$1</li>');
      
      return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} className="mb-2" />;
    });
  };

  return (
    <div className="space-y-12">
      {/* About Section */}
      <section>
        <h2 className="text-xl font-black text-foreground tracking-tight mb-6 flex items-center gap-2 uppercase tracking-[0.1em]">
          About this app
        </h2>
        <div className="relative">
          <div className={cn(
            "text-base text-muted-foreground leading-relaxed transition-all duration-500 font-medium",
            !expanded && "line-clamp-4 overflow-hidden"
          )}>
            {formatText(description)}
          </div>
          
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mt-4 flex items-center gap-1.5 text-xs font-black text-primary hover:underline uppercase tracking-widest"
          >
            {expanded ? (
              <>Less <ChevronUp size={14} /></>
            ) : (
              <>See more <ChevronDown size={14} /></>
            )}
          </button>
        </div>
      </section>

      {/* Rate this app CTA */}
      {!isAuthenticated ? (
        <section className="relative overflow-hidden rounded-3xl">
          <div className="relative p-6 rounded-3xl bg-card border border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star size={14} className="text-primary fill-primary/20" />
                </div>
                <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                  Rate this app
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed font-medium">
                Log in to share your thoughts and rate this app.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button
                onClick={() => window.location.href = "/auth"}
                className="w-full md:w-auto rounded-xl px-8 py-5 h-auto font-black uppercase tracking-[0.2em] text-[9px] bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/5"
              >
                Login to Review
              </Button>
            </div>
          </div>
        </section>
      ) : !userReviewed ? (
        <section className="relative group overflow-hidden rounded-3xl">
          {!userTried && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/40 backdrop-blur-[2px] cursor-not-allowed group/blur">
              <div className="bg-background/90 px-5 py-2.5 rounded-full border border-border/40 shadow-2xl opacity-0 group-hover/blur:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/blur:translate-y-0">
                <p className="text-[10px] font-black text-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                  <Star size={12} className="text-primary fill-primary" />
                  Please try the app first to rate
                </p>
              </div>
            </div>
          )}
          <div className={cn(
            "absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-3xl blur-xl opacity-50 transition duration-1000",
            userTried && "group-hover:opacity-100 group-hover:duration-200"
          )}></div>
          <div className={cn(
            "relative p-6 rounded-3xl bg-card border border-border/40 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500",
            !userTried && "opacity-50 grayscale-[0.5] blur-[1px]"
          )}>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Star size={14} className="text-primary fill-primary/20" />
                </div>
                <h2 className="text-base font-black text-foreground uppercase tracking-wider">
                  Rate this app
                </h2>
              </div>
              <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed font-medium">
                Your feedback drives innovation. Share your thoughts and help shape the future of this app.
              </p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              <Button 
                onClick={onRateClick}
                disabled={!userTried}
                className={cn(
                  "w-full md:w-auto rounded-xl px-8 py-5 h-auto font-black uppercase tracking-[0.2em] text-[9px] transition-all duration-300 relative group/btn overflow-hidden",
                  userTried 
                    ? "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/5" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Write a review
                </span>
                {userTried && (
                  <div className="absolute inset-0 bg-primary translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 -z-0"></div>
                )}
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default AppDetailDescription;
