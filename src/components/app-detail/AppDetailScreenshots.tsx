import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDetailScreenshotsProps {
  screenshots: string[];
}

const AppDetailScreenshots = ({ screenshots }: AppDetailScreenshotsProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Horizontal Scroll Area */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
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
          </button>
        ))}
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
