import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* CTA */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Ready to launch your next project?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Join thousands of builders showcasing their work and growing their audience.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="h-12 px-8 rounded-lg text-base font-semibold gap-2"
          >
            Get Started <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
