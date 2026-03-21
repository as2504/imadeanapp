import { useEffect, useRef, useState } from "react";
import { Users, Tag, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Users,
    label: "Follow Creators",
    description: "Connect with the minds behind the most innovative AI experiments.",
    bg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Tag,
    label: "Filter by Tag",
    description: "Narrow down your search by category, technology, or platform.",
    bg: "bg-hero-accent/20",
    iconColor: "text-hero-accent",
  },
  {
    icon: TrendingUp,
    label: "See Trending",
    description: "Stay updated with the tools and apps currently leading the pack.",
    bg: "bg-primary/8",
    iconColor: "text-primary/70",
  },
];

const FeaturesSection = () => {
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
    <section ref={ref} className="py-24 bg-surface">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.label}
              className={`bg-background rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 ${
                visible
                  ? `animate-reveal animate-reveal-delay-${i + 1}`
                  : "opacity-0"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5`}>
                <feature.icon size={22} className={feature.iconColor} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.label}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
