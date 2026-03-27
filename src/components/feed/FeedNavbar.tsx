import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Home,
  TrendingUp,
  Bell,
  Bookmark,
  User,
  Plus,
  LogOut,
  Menu,
  X,
  Moon,
} from "lucide-react";
import SearchBar from "@/components/feed/SearchBar";

const navItems = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Trending", icon: TrendingUp, href: "/trending" },
];

const FeedNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left: logo */}
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Plus size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-foreground tracking-tight hidden sm:inline-block">
              Showcase
            </span>
          </button>

          {/* Center: search (desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Right: nav icons */}
          <div className="flex items-center gap-2">
            {/* Mobile search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl transition-all"
            >
              <Search size={22} />
            </button>

            <div className="hidden lg:flex items-center gap-1 mr-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <button className="hidden sm:flex p-2.5 text-muted-foreground hover:text-foreground hover:bg-surface rounded-xl transition-all">
              <Bell size={20} />
            </button>

            <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block" />

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-2xl hover:bg-surface transition-all outline-none">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <User size={18} className="text-primary" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/40">
                <div className="px-2 py-3 mb-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Account</p>
                </div>
                <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-xl py-2.5 gap-3 cursor-pointer">
                  <User size={18} className="text-muted-foreground" />
                  <span className="font-bold">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/publish")} className="rounded-xl py-2.5 gap-3 cursor-pointer">
                  <Plus size={18} className="text-muted-foreground" />
                  <span className="font-bold">Publish App</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <div className="flex items-center justify-between px-2 py-2">
                  <div className="flex items-center gap-3">
                    <Moon size={18} className="text-muted-foreground" />
                    <span className="text-sm font-bold">Dark Mode</span>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={toggleDarkMode}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem onClick={signOut} className="rounded-xl py-2.5 gap-3 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut size={18} />
                  <span className="font-bold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile search bar (only on mobile when toggled) */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
            <SearchBar className="w-full" mobile />
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
          <button onClick={() => navigate("/publish")} className="flex flex-col items-center gap-0.5 px-3 py-1 text-primary">
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
