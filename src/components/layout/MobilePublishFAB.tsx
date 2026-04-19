import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Rocket, Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MobilePublishFAB = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-40">
      {open && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 items-end animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            onClick={() => { setOpen(false); navigate("/publish"); }}
            className="flex items-center gap-2 bg-card border border-border/40 px-3 py-2 rounded-full shadow-lg text-xs font-semibold text-foreground"
          >
            <Rocket size={14} className="text-primary" /> Publish app
          </button>
          <button
            onClick={() => { setOpen(false); navigate("/post-idea"); }}
            className="flex items-center gap-2 bg-card border border-border/40 px-3 py-2 rounded-full shadow-lg text-xs font-semibold text-foreground"
          >
            <Lightbulb size={14} className="text-amber-500" /> Post idea
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center transition-transform active:scale-95",
          open && "rotate-45",
        )}
        aria-label="Create"
      >
        {open ? <X size={20} /> : <Plus size={22} />}
      </button>
    </div>
  );
};

export default MobilePublishFAB;
