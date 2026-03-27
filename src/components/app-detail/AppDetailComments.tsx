import { useState } from "react";
import { Star, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AppDetailCommentsProps {
  appId: string;
  userTried: boolean;
}

const comments = [
  {
    id: "1",
    user: "Julian Black",
    avatar: "JB",
    rating: 5,
    date: "2 days ago",
    text: "The Vibe-Engine actually feels different. Most fluid AI interface I've used this year. Great work on the sync features."
  },
  {
    id: "2",
    user: "Sarah Chen",
    avatar: "SC",
    rating: 4,
    date: "1 week ago",
    text: "Love the dark mode palette. Looking forward to the API integration in the next version."
  }
];

const AppDetailComments = ({ appId, userTried }: AppDetailCommentsProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-12">
      {/* 1. Rating & Input Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-black text-foreground tracking-tight uppercase tracking-[0.1em]">
          Ratings & Reviews
        </h2>

        <div className={cn(
          "p-8 rounded-[2rem] border border-border/40 bg-card transition-all",
          !userTried ? "opacity-40 grayscale pointer-events-none" : "shadow-xl"
        )}>
          {!userTried && (
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">
              Try the app to leave a review
            </p>
          )}

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90"
                >
                  <Star 
                    size={28} 
                    className={cn(
                      "transition-colors",
                      s <= rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/20"
                    )} 
                  />
                </button>
              ))}
            </div>

            <div className="relative">
              <Textarea 
                placeholder="Share your experience..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px] rounded-2xl border-border/40 bg-surface focus:bg-background transition-all p-5 placeholder:text-muted-foreground/30 font-medium"
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                  Reviewing as Anonymous
                </p>
                <Button 
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 h-11 font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Submit Review <Send size={14} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Success Micro-interaction */}
          {submitted && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-500 z-[100]">
              <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">
                <CheckCircle2 size={16} /> Review submitted successfully
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Comments List */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
            {comments.length} Comments
          </span>
        </div>

        <div className="space-y-10">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-5 group">
              <div className="w-12 h-12 rounded-2xl bg-surface border border-border/20 flex items-center justify-center text-sm font-black text-primary shrink-0 uppercase tracking-tighter shadow-sm">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-foreground uppercase tracking-tight">
                    {c.user}
                  </h4>
                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest bg-surface px-2 py-1 rounded-lg">
                    {c.date}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={10} 
                      className={cn(
                        s <= c.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground/20"
                      )} 
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-medium">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AppDetailComments;
