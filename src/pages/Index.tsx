import { useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, TrendingUp, Users } from "lucide-react";

const howItWorks = [
  {
    icon: Upload,
    step: "01",
    title: "Publish",
    description: "Submit your app with screenshots, tags, and platform links. Go live in minutes.",
  },
  {
    icon: TrendingUp,
    step: "02",
    title: "Get Discovered",
    description: "Our trending algorithm surfaces your app based on real engagement—not vanity metrics.",
  },
  {
    icon: Users,
    step: "03",
    title: "Grow",
    description: "Collect feedback, reviews, and build a following. Iterate and ship with confidence.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />

      {/* How It Works */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Three steps to get your app in front of the right audience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <item.icon size={24} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-primary">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
