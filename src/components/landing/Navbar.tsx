import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 transition-all duration-300">
      <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => navigate("/")} 
            className="text-xl font-black tracking-tighter text-foreground group flex items-center gap-1"
          >
            Showcase<span className="text-primary group-hover:scale-125 transition-transform inline-block">.</span>
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Home</button>
            <button onClick={() => navigate("/trending")} className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Explore</button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/auth")} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors px-4">Log in</button>
          <Button 
            onClick={() => navigate("/publish")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 h-10 font-bold text-xs transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
          >
            Publish App
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
