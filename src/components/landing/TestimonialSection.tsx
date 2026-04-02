import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const logos = ["TechFlow", "Lumina", "Vertex AI", "Sphere", "Prism"];

const TestimonialSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-32 bg-surface/30">
      <div className="container mx-auto px-6">
        {/* Trust badges */}
        <div className="text-center mb-32">
          <p className={`text-[10px] font-bold tracking-[0.3em] uppercase text-muted-foreground/60 mb-12 transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
            Powering Discovery for Global Teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {logos.map((name, i) => (
              <span
                key={name}
                className={`text-xl md:text-2xl font-black text-foreground/20 hover:text-primary/40 transition-all duration-500 cursor-default ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Highlighted Quote */}
        <div className={`max-w-4xl mx-auto mb-32 transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <div className="relative p-10 md:p-16 rounded-[3rem] bg-background border border-border/40 shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <Star size={120} className="fill-foreground" />
            </div>
            
            <blockquote className="text-2xl md:text-4xl font-bold text-foreground leading-[1.1] tracking-tight relative z-10">
              "imadeanapp is the first platform that actually understands the <span className="text-primary">aesthetic of AI.</span> It's not just a directory; it's a launchpad for modern software."
            </blockquote>
            
            <div className="mt-12 flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-sm font-black text-primary border border-primary/20">
                MC
              </div>
              <div>
                <p className="text-base font-bold text-foreground">Marcus Chen</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Product Design · TechFlow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className={`text-center transition-all duration-1000 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none mb-10">
            Ready to claim your <br /> spot in the <span className="text-primary italic">gallery?</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all group"
            >
              Get Started Now <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <p className="mt-6 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
            Join 2,000+ creators building the future
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
