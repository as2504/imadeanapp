import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PublicNavbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-navbar/90 backdrop-blur-xl border-b border-border/40">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6">
        <button onClick={() => navigate("/")} className="text-lg font-bold tracking-tight text-foreground">
          Showcase
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-foreground">
            Log in
          </Button>
          <Button size="sm" onClick={() => navigate("/auth")} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
