import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--navbar))]/90 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="text-lg font-bold text-foreground tracking-tight"
        >
          Showcase<span className="text-primary">.</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Product</button>
          <button onClick={() => navigate("/trending")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Explore</button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/auth")} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3">
            Log in
          </button>
          <Button
            onClick={() => navigate("/auth")}
            size="sm"
            className="h-9 px-4 rounded-lg text-sm font-medium"
          >
            Get Started <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
