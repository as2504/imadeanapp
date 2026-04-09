import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface AppDetailScreenshotsProps {
  screenshots: string[];
}

const AppDetailScreenshots = ({ screenshots }: AppDetailScreenshotsProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      {/* Gallery with arrows */}
      <div className="relative group/gallery">
        {screenshots.length > 1 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all opacity-0 group-hover/gallery:opacity-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background transition-all opacity-0 group-hover/gallery:opacity-100"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth">
          {screenshots.map((src, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(src)}
              className="relative shrink-0 h-[220px] sm:h-[280px] md:h-[340px] w-auto transition-all duration-500 snap-center group"
            >
              <img
                src={src}
                alt={`Screenshot ${i + 1}`}
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02] rounded-xl"
              />
              {/* Image indicator */}
              {screenshots.length > 1 && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold tracking-wide backdrop-blur-sm">
                  {i + 1}/{screenshots.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-8 right-8 p-3 rounded-full bg-surface hover:bg-surface-hover transition-colors shadow-lg border border-border/40"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} className="text-foreground" />
          </button>
          {/* Fullscreen indicator */}
          <span className="absolute bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-black/60 text-white text-xs font-bold tracking-wide backdrop-blur-sm">
            {screenshots.indexOf(selectedImage) + 1}/{screenshots.length}
          </span>
          <img
            src={selectedImage}
            alt="Fullscreen screenshot"
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500"
          />
        </div>
      )}
    </div>
  );
};

export default AppDetailScreenshots;
