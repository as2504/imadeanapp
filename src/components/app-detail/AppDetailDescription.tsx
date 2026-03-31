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
  onRateClick: () => void;
}

const AppDetailDescription = ({ description, userTried, userReviewed, onRateClick }: AppDetailDescriptionProps) => {
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
      {!userReviewed && (
        <section className="p-8 rounded-[2rem] bg-surface border border-border/40 text-center">
          <h2 className="text-xl font-black text-foreground tracking-tight mb-2 uppercase tracking-[0.1em]">
            Rate this app
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Share your experience with the community and help the creator improve.
          </p>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button 
                    onClick={onRateClick}
                    disabled={!userTried}
                    className={cn(
                      "rounded-full px-8 py-6 h-auto font-bold uppercase tracking-widest text-xs transition-all",
                      userTried ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                    )}
                  >
                    <Star size={16} className={cn("mr-2", userTried && "fill-current")} />
                    Write a review
                  </Button>
                </div>
              </TooltipTrigger>
              {!userTried && (
                <TooltipContent>
                  <p>Please try the app first before giving the rating.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </section>
      )}
    </div>
  );
};

export default AppDetailDescription;
