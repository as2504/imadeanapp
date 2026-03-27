import { useNavigate } from "react-router-dom";
import { ExternalLink, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RelatedAppsProps {
  currentId: string;
}

const related = [
  {
    id: "2",
    name: "Vertex AI",
    icon: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=64",
    tag: "AI Tool",
    rating: 4.8
  },
  {
    id: "3",
    name: "Sphere CRM",
    icon: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=64",
    tag: "SaaS",
    rating: 4.7
  },
  {
    id: "4",
    name: "Prism Design",
    icon: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=64",
    tag: "Design",
    rating: 4.9
  }
];

const RelatedApps = ({ currentId }: RelatedAppsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
          Related Apps
        </h2>
        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
          View all <ChevronRight size={12} />
        </button>
      </div>

      <div className="space-y-4">
        {related.map((app) => (
          <button 
            key={app.id} 
            onClick={() => navigate(`/app/${app.id}`)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/20 hover:shadow-lg transition-all group text-left"
          >
            <div className="w-12 h-12 rounded-xl border border-border/20 overflow-hidden shrink-0 shadow-sm">
              <img src={app.icon} alt={app.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-foreground truncate uppercase tracking-tight">
                {app.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                  {app.tag}
                </span>
                <span className="text-[10px] text-muted-foreground/20">·</span>
                <div className="flex items-center gap-0.5">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-black text-muted-foreground/60">{app.rating}</span>
                </div>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-surface text-muted-foreground/40 group-hover:text-primary transition-colors">
              <ExternalLink size={14} />
            </div>
          </button>
        ))}
      </div>

      {/* Mini CTA card */}
      <div className="p-8 rounded-[2.5rem] bg-primary text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
          <Star size={100} className="text-white fill-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-lg font-black leading-tight tracking-tight uppercase">
            Ready to launch?
          </h3>
          <p className="text-xs text-primary-foreground/70 mt-2 leading-relaxed font-medium">
            Join 2,000+ creators and get your app featured globally.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-6 w-full rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-transparent font-black text-[10px] uppercase tracking-widest shadow-lg h-10"
            onClick={(e) => { e.stopPropagation(); navigate("/publish"); }}
          >
            Publish Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RelatedApps;
