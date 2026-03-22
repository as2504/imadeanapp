import { useState, useEffect, useRef } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import TrendingFilters from "@/components/trending/TrendingFilters";
import TrendingSidebar from "@/components/trending/TrendingSidebar";
import TrendingCard from "@/components/trending/TrendingCard";
import FeedLayout from "@/components/layout/FeedLayout";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
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

      <main className="pt-20 pb-24 md:pb-8">
        <FeedLayout sidebar={<TrendingSidebar />}>
          {({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
            <div className="space-y-5">
              <TrendingFilters onOpenSidebar={onOpenSidebar} />

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
          )}
        </FeedLayout>
      </main>
    </div>
  );
};

export default Trending;
