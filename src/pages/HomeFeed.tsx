import { useState, useEffect, useRef } from "react";
import FeedNavbar from "@/components/feed/FeedNavbar";
import FeedFilters from "@/components/feed/FeedFilters";
import FeedSidebar from "@/components/feed/FeedSidebar";
import AppCard from "@/components/feed/AppCard";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import EmptyFeed from "@/components/feed/EmptyFeed";
import { mockPosts } from "@/data/mockPosts";

const HomeFeed = () => {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState(mockPosts);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Simulate load
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // Scroll reveal observer
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
  }, [loading, posts]);

  return (
    <div className="min-h-screen bg-background">
      <FeedNavbar />

      <main className="container mx-auto px-4 lg:px-6 pt-20 pb-24 md:pb-8">
        <div className="flex gap-8">
          {/* Feed column */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0 space-y-5">
            <FeedFilters />

            {loading ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <EmptyFeed />
            ) : (
              <div className="space-y-4">
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(post.id, el);
                    }}
                    className="opacity-0"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <AppCard post={post} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <FeedSidebar />
        </div>
      </main>
    </div>
  );
};

export default HomeFeed;
