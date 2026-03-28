import { Zap, ShieldCheck, BarChart3, Rocket, Check } from "lucide-react";

const features = [
  {
    icon: Zap,
    badge: "Discovery",
    title: "Smart Feed",
    description: "Our trending algorithm surfaces high-quality apps with real-time community signal and engagement data.",
    bullets: ["Personalized recommendations", "Real-time trending", "Category & tag filtering"],
  },
  {
    icon: Rocket,
    badge: "Publish",
    title: "Ship Fast",
    description: "Go from idea to published in minutes. Rich metadata, auto-previews, and instant global indexing.",
    bullets: ["Multi-platform support", "SEO-optimized listings", "Version history tracking"],
  },
  {
    icon: ShieldCheck,
    badge: "Identity",
    title: "Creator Profiles",
    description: "Build trust with a professional portfolio showcasing your tech stack and shipped products.",
    bullets: ["Verified builder badges", "Skills & experience", "Follow system"],
  },
  {
    icon: BarChart3,
    badge: "Analytics",
    title: "Growth Insights",
    description: "Understand your impact with views, ratings, and engagement tracking across all your apps.",
    bullets: ["Rating system", "View analytics", "Community feedback"],
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything you need to ship and grow
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete platform for builders who want to showcase their work, get feedback, and reach users.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-card border border-border/40 rounded-xl p-8 space-y-4 hover:border-border transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon size={18} className="text-primary" />
                </div>
                <span className="text-xs font-medium text-primary px-2 py-0.5 rounded-md bg-primary/10">
                  {f.badge}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              <ul className="space-y-2 pt-2">
                {f.bullets.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-foreground/70">
                    <Check size={14} className="text-primary shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
