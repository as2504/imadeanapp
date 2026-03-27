import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, Heart, Sparkles, User, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tabs = [
  { 
    id: "for-you", 
    label: "For You",
    title: "Vibe-coded discovery.",
    description: "A personalized AI feed that prioritizes high-fidelity previews and community signal.",
    bullets: ["Smart recommendations", "Design-first feed", "One-tap try"],
    icon: Heart,
    image: "/ForYou.png"
  },
  { 
    id: "publish", 
    label: "Publish",
    title: "Launch in seconds.",
    description: "The premium workflow to showcase your creations with rich metadata and SEO.",
    bullets: ["Auto-previews", "Multi-platform links", "Global indexing"],
    icon: Sparkles,
    image: "/Publish.png"
  },
  { 
    id: "profile", 
    label: "Profile",
    title: "Proof of Work.",
    description: "A professional identity hub showcasing your tech stack and launched portfolio.",
    bullets: ["Verified status", "Tech stack display", "Collab-ready"],
    icon: User,
    image: "/Profile.png"
  },
  { 
    id: "showcase", 
    label: "Showcase",
    title: "Global Momentum.",
    description: "Real-time leaderboards tracking the fastest growing apps in the ecosystem.",
    bullets: ["Trending algorithm", "User feedback loops", "Growth analytics"],
    icon: LayoutGrid,
    image: "/Showcase.png"
  }
];

const HeroSection = () => {
  const [activeIndex, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const activeTab = tabs[activeIndex];
  const totalTabs = tabs.length;
  const tabDuration = 5000;
  
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [lineStyles, setLineStyles] = useState({ left: 0, width: 0 });

  // FIXED SYNC LOGIC: Only change tab when progress actually hits 100
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((idx) => (idx + 1) % totalTabs);
          return 0;
        }
        return prev + (100 / (tabDuration / 100));
      });
    }, 100);
    return () => clearInterval(timer);
  }, [totalTabs, tabDuration]);

  useEffect(() => {
    const calculateLine = () => {
      if (!tabsContainerRef.current) return;
      const buttons = tabsContainerRef.current.querySelectorAll('button');
      if (buttons.length === 0) return;
      const firstBtn = buttons[0];
      const lastBtn = buttons[buttons.length - 1];
      const containerRect = tabsContainerRef.current.getBoundingClientRect();
      const firstRect = firstBtn.getBoundingClientRect();
      const lastRect = lastBtn.getBoundingClientRect();
      setLineStyles({ 
        left: firstRect.left - containerRect.left, 
        width: lastRect.right - firstRect.left 
      });
    };
    calculateLine();
    const timeout = setTimeout(calculateLine, 100);
    window.addEventListener('resize', calculateLine);
    return () => {
      window.removeEventListener('resize', calculateLine);
      clearTimeout(timeout);
    };
  }, []);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setProgress(0);
  };

  return (
    <section className="pt-24 pb-24 bg-background overflow-hidden transition-colors duration-300">
      <div className="container mx-auto max-w-[1200px] px-6">
        
        <div className="text-center mb-12 md:mb-20 space-y-6">
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1] text-foreground animate-in fade-in slide-in-from-top-4 duration-1000">
            Discover and share <br /> 
            <span className="text-primary italic relative">
              vibe-coded
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span> apps.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-top-4 delay-200 duration-1000">
            The premium destination for modern builders. Launch fast, iterate with real-time feedback, and scale your creations globally.
          </p>
        </div>

        <div className="flex flex-col items-center w-full">
          
          <div className="relative inline-flex flex-col items-center max-w-full">
            <div 
              ref={tabsContainerRef}
              className="flex items-end -space-x-4 mb-0 relative z-20 px-4 overflow-x-auto scrollbar-hide"
            >
              {tabs.map((tab, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "relative h-12 md:h-16 px-6 md:px-14 rounded-t-[1.5rem] md:rounded-t-[2.5rem] font-black text-[11px] md:text-sm transition-all duration-500 border-x border-t flex items-center justify-center gap-2 group shrink-0",
                      isActive 
                        ? "bg-surface border-border text-primary z-30 scale-105 origin-bottom translate-y-[-2px] shadow-[0_-8px_30px_rgba(0,0,0,0.02)]" 
                        : "bg-background border-border/20 text-muted-foreground/40 hover:text-muted-foreground z-10"
                    )}
                  >
                    <tab.icon size={16} className={cn("transition-colors", isActive ? "text-primary" : "text-muted-foreground/20 group-hover:text-muted-foreground/40")} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* THE CONSTRAINED PROGRESS LINE */}
            <div 
              className="absolute bottom-0 h-1 bg-border/20 z-40 mb-[-1px] overflow-hidden rounded-full pointer-events-none"
              style={{ left: `${lineStyles.left}px`, width: `${lineStyles.width}px` }}
            >
              <div 
                className="h-full bg-primary transition-all duration-100 ease-linear shadow-[0_0_15px_hsl(var(--primary)/0.6)]"
                style={{ width: `${((activeIndex * 100 / totalTabs) + (progress / totalTabs))}%` }}
              />
            </div>
          </div>

          <div className="w-full relative z-10 rounded-b-[2.5rem] md:rounded-b-[4rem] rounded-tl-[2.5rem] md:rounded-tl-[4rem] md:rounded-tr-[4rem] bg-surface border border-border/40 p-3 md:p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
            <div className="bg-card rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-border/20 overflow-hidden flex flex-col lg:flex-row">
              
              <div key={`image-${activeTab.id}`} className="order-1 lg:order-2 flex-1 bg-background/50 border-b lg:border-b-0 lg:border-l border-border/40 p-4 md:p-12 flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                <div className="relative w-full h-full max-w-full max-h-[300px] md:max-h-[500px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-border/20 bg-background flex items-center justify-center">
                  <img src={activeTab.image} alt={activeTab.label} className="max-w-full max-h-full object-contain" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              <div key={`text-${activeTab.id}`} className="order-2 lg:order-1 w-full lg:w-[450px] p-6 md:p-12 space-y-6 md:space-y-10 flex flex-col justify-center">
                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] bg-primary/10 flex items-center justify-center">
                    <activeTab.icon size={28} className="text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">{activeTab.title}</h2>
                  <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">{activeTab.description}</p>
                </div>

                <ul className="space-y-3 md:space-y-5 animate-in fade-in slide-in-from-left-6 delay-200 duration-700">
                  {activeTab.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm md:text-base font-bold text-foreground/80">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-primary" strokeWidth={4} />
                      </div>
                      {bullet}
                    </li>
                  ))}
                </ul>

                <div className="pt-4 md:pt-6 animate-in fade-in slide-in-from-left-6 delay-300 duration-700">
                  <Button onClick={() => navigate("/auth")} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl md:rounded-[1.5rem] px-8 md:px-12 h-14 md:h-16 font-black text-xs md:text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95">
                    Explore {activeTab.label} <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

            </div>
          </div>

          <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none -z-10 opacity-30">
            <div className="absolute top-0 left-0 w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[20%] right-0 w-[40%] h-[40%] bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;
