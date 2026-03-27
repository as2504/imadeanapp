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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <HeroSection />
      
      <div className="relative">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 origin-right z-0" />
        <FeaturesSection />
      </div>
      
      {/* Final CTA Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
              Ready to launch your <br /> 
              <span className="text-primary italic relative">
                next big thing?
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </h2>
            <p className="text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              Join a community of 2,000+ builders. Showcase your work, get feedback, and scale your creations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="h-16 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all group gap-3"
              >
                Get Started Now <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
