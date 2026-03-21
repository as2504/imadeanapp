import { useEffect, useRef, useState } from "react";

const logos = ["TechFlow", "Lumina", "Vertex AI", "Sphere", "Prism"];

const TestimonialSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24">
      <div className="container mx-auto px-6">
        {/* Trust badges */}
        <div
          className={`text-center transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-10">
            Trusted by Industry Leaders
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 mb-20">
            {logos.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-foreground/40 hover:text-foreground/70 transition-colors duration-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div
          className={`max-w-2xl mx-auto text-center transition-all duration-700 ease-out delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <blockquote className="text-xl md:text-2xl font-medium italic text-foreground/80 leading-relaxed">
            "Showcase has completely redefined how our team discovers emerging AI tools. The quality and curation are unmatched in the current landscape."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-hero-accent/30 flex items-center justify-center text-sm font-bold text-foreground">
              MC
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Marcus Chen</p>
              <p className="text-xs text-muted-foreground">Lead Product Design, TechFlow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
