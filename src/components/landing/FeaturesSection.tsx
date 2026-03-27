import { Zap, ShieldCheck, BarChart3 } from "lucide-react";

const benefits = [
  {
    icon: Zap,
    title: "Fast Discovery",
    description: "Our trending algorithm surfaces high-quality vibe-coded apps in real-time."
  },
  {
    icon: ShieldCheck,
    title: "Verified Identity",
    description: "Build trust with profiles that showcase your actual technical work and tech stack."
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Understand your impact with detailed views, engagement, and conversion tracking."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white border-t border-black/[0.03]">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {benefits.map((benefit, i) => (
            <div key={i} className="space-y-4 text-center md:text-left animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-10 h-10 rounded-xl bg-[#4285F4]/5 flex items-center justify-center mx-auto md:mx-0">
                <benefit.icon size={20} className="text-[#4285F4]" />
              </div>
              <h3 className="text-lg font-bold text-foreground tracking-tight">{benefit.title}</h3>
              <p className="text-sm text-black/40 leading-relaxed font-medium">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
