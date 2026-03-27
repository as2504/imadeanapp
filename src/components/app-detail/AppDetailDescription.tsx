import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDetailDescriptionProps {
  description: string;
  whatsNew: string;
  lastUpdated: string;
}

const AppDetailDescription = ({ description, whatsNew, lastUpdated }: AppDetailDescriptionProps) => {
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

      {/* What's New Section */}
      <section className="p-8 rounded-[2rem] bg-surface border border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2 uppercase tracking-[0.1em]">
            What's new
          </h2>
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] bg-background px-3 py-1 rounded-full border border-border/40">
            Updated {lastUpdated}
          </span>
        </div>
        <div className="text-base text-muted-foreground leading-relaxed font-medium">
          {formatText(whatsNew)}
        </div>
      </section>
    </div>
  );
};

export default AppDetailDescription;
