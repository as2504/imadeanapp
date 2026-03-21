import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Home,
  TrendingUp,
  Compass,
  Bell,
  Bookmark,
  User,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Trending", icon: TrendingUp, href: "/trending" },
  { label: "Explore", icon: Compass, href: "/explore" },
];

const FeedNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between h-14 px-4 lg:px-6">
          {/* Left: logo */}
          <button
            onClick={() => navigate("/home")}
            className="text-lg font-bold text-foreground tracking-tight shrink-0"
          >
            Showcase
          </button>

          {/* Center: search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search apps, creators, tags..."
                className="h-9 rounded-full bg-surface border-0 pl-9 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
              />
            </div>
          </div>

          {/* Right: nav icons */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                <item.icon size={16} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}

            <div className="w-px h-5 bg-border/60 mx-1" />

            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors">
              <Bell size={18} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors">
              <Bookmark size={18} />
            </button>

            <Button
              size="sm"
              className="ml-2 rounded-full h-8 px-3 text-xs gap-1.5"
              onClick={() => {}}
            >
              <Plus size={14} />
              <span className="hidden lg:inline">Publish</span>
            </Button>

            <div className="w-px h-5 bg-border/60 mx-1" />

            <button
              onClick={() => navigate("/account")}
              className="p-1.5 rounded-full hover:bg-surface transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
            </button>

            <button
              onClick={signOut}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile: search + menu */}
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-muted-foreground"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-foreground"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search..."
                className="h-9 rounded-full bg-surface border-0 pl-9 text-sm"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.href);
                  setMobileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
            <button
              onClick={signOut}
              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40">
        <div className="flex items-center justify-around h-14">
          <button
            onClick={() => navigate("/home")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === "/home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate("/trending")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === "/trending" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <TrendingUp size={20} />
            <span className="text-[10px] font-medium">Trending</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-primary">
            <div className="w-10 h-10 -mt-4 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Plus size={20} className="text-primary-foreground" />
            </div>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground">
            <Bookmark size={20} />
            <span className="text-[10px] font-medium">Saved</span>
          </button>
          <button
            onClick={() => navigate("/account")}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              location.pathname === "/account" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Account</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default FeedNavbar;
