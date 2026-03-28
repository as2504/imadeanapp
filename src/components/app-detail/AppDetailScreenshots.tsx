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
      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x px-1">
        {screenshots.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(src)}
            className="relative shrink-0 h-[300px] md:h-[450px] w-auto rounded-2xl overflow-hidden bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 snap-center group border border-border/10"
          >
            <img 
              src={src} 
              alt={`Screenshot ${i + 1}`} 
              className="h-full w-auto object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
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
