import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Sparkles, User, LayoutGrid, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "for-you", label: "For You", icon: Heart, image: "/ForYou.png", title: "Personalized discovery.", description: "A smart feed that surfaces high-quality apps based on community signal.", bullets: ["Smart recommendations", "Design-first feed", "One-tap try"] },
  { id: "publish", label: "Publish", icon: Sparkles, image: "/Publish.png", title: "Launch in seconds.", description: "The fastest workflow to showcase your creations with rich metadata.", bullets: ["Auto-previews", "Multi-platform links", "Global indexing"] },
  { id: "profile", label: "Profile", icon: User, image: "/Profile.png", title: "Proof of Work.", description: "A professional identity hub for your tech stack and portfolio.", bullets: ["Verified status", "Tech stack display", "Collab-ready"] },
  { id: "showcase", label: "imadeanapp", icon: LayoutGrid, image: "/Showcase.png", title: "Global Momentum.", description: "Real-time leaderboards tracking the fastest growing apps.", bullets: ["Trending algorithm", "User feedback", "Growth analytics"] },
];

const HeroSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const activeTab = tabs[activeIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIndex((idx) => (idx + 1) % tabs.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="pt-32 pb-24 bg-background relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Headline */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            The platform for{" "}
            <span className="text-primary">modern builders</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Discover, publish, and grow your apps. Join a community of creators shipping real products.
          </p>
          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="h-12 px-8 rounded-lg text-base font-semibold gap-2"
            >
              Start Building <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* Tab carousel */}
        <div className="mt-16">
          {/* Tab buttons */}
          <div className="flex justify-center gap-1 mb-6">
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => { setActiveIndex(i); setProgress(0); }}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeIndex === i ? "text-foreground bg-card" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {activeIndex === i && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-border/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Content card */}
          <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <div className="flex flex-col lg:flex-row">
              {/* Text */}
              <div key={`text-${activeTab.id}`} className="w-full lg:w-[400px] p-8 lg:p-10 flex flex-col justify-center space-y-6 animate-in fade-in duration-500">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <activeTab.icon size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{activeTab.title}</h2>
                <p className="text-muted-foreground">{activeTab.description}</p>
                <ul className="space-y-3">
                  {activeTab.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground/80">
                      <Check size={14} className="text-primary shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div key={`img-${activeTab.id}`} className="flex-1 border-t lg:border-t-0 lg:border-l border-border/40 bg-background/50 p-6 lg:p-8 flex items-center justify-center animate-in fade-in duration-500">
                <div className="rounded-lg overflow-hidden shadow-2xl border border-border/20 max-h-[400px]">
                  <img src={activeTab.image} alt={activeTab.label} className="max-w-full max-h-[400px] object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
