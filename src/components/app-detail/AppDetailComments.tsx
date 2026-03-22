import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockComments = [
  { id: "1", name: "Priya S.", initials: "PS", time: "2 hours ago", text: "This is exactly what I've been looking for. The AI integration is really smooth.", likes: 14 },
  { id: "2", name: "Marcus L.", initials: "ML", time: "5 hours ago", text: "Clean UI and super fast. Would love to see a dark mode option.", likes: 8 },
  { id: "3", name: "Aiko T.", initials: "AT", time: "1 day ago", text: "Great work! Shared this with my team. We're already using it daily.", likes: 23 },
];

const AppDetailComments = () => {
  const [newComment, setNewComment] = useState("");

  return (
    <section className="py-6 border-b border-border/40">
      <h2 className="text-sm font-semibold text-foreground mb-5">Community Feedback</h2>

      {/* Add comment */}
      <div className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
          You
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts…"
            className="flex-1 bg-surface rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
          <Button size="sm" className="rounded-full h-9 px-5 text-xs" disabled={!newComment.trim()}>
            Post
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-5">
        {mockComments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-foreground">{c.name}</span>
                <span className="text-muted-foreground/50">{c.time}</span>
              </div>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{c.text}</p>
              <button className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={12} />
                <span>{c.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AppDetailComments;
