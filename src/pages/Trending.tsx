import { useState, useEffect, useRef } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import TrendingFilters from "@/components/trending/TrendingFilters";
import TrendingSidebar from "@/components/trending/TrendingSidebar";
import TrendingCard from "@/components/trending/TrendingCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import { TrendingUp } from "lucide-react";
import { mockTrending } from "@/data/mockTrending";

const Trending = () => {
  const [loading, setLoading] = useState(true);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />

      <main className="container mx-auto px-4 lg:px-6 pt-20 pb-24 md:pb-8">
        {/* Page header */}
        <div className="max-w-2xl lg:max-w-none mb-6">
          <div className="flex items-center gap-2.5 mb-1">
            <TrendingUp size={22} className="text-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Trending Apps
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover the fastest-growing apps in the community right now.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Main column */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-5">
            <TrendingFilters />

            {loading ? (
              <FeedSkeleton />
            ) : (
              <div className="space-y-4">
                {mockTrending.map((app, i) => (
                  <div
                    key={app.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(app.id, el);
                    }}
                    className="opacity-0"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <TrendingCard app={app} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <TrendingSidebar />
        </div>
      </main>
    </div>
  );
};

export default Trending;
