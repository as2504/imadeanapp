import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={ref}
      className="min-h-screen flex items-center pt-16"
    >
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="max-w-lg">
          <h1
            className={`text-display text-foreground transition-all duration-700 ease-out ${
              visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-sm"
            }`}
          >
            Discover
            <br />
            Next-Gen AI
            <br />
            Apps
          </h1>
          <p
            className={`mt-6 text-lg text-muted-foreground leading-relaxed max-w-md transition-all duration-700 ease-out delay-100 ${
              visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-sm"
            }`}
          >
            A curated showcase of AI-crafted applications designed to elevate your digital experience.
          </p>
          <div
            className={`mt-8 flex items-center gap-4 transition-all duration-700 ease-out delay-200 ${
              visible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-4 blur-sm"
            }`}
          >
            <Button variant="hero" size="lg">
              Explore Apps
            </Button>
            <Button variant="hero-outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Right illustration */}
        <div
          className={`hidden md:flex justify-center transition-all duration-1000 ease-out delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="w-full max-w-md aspect-square bg-surface rounded-3xl flex items-center justify-center relative overflow-hidden">
            {/* Concentric circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full border border-border/60" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full border border-border/40" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-border/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 rounded-full border border-border/50 rotate-45" style={{ borderRadius: '40%' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
