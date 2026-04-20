import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Home, TrendingUp, Lightbulb, User, Plus, Settings, Rocket, X } from "lucide-react";
import SearchBar from "@/components/feed/SearchBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const navItems = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Trending", icon: TrendingUp, href: "/trending" },
  { label: "Upcoming", icon: Lightbulb, href: "/upcoming", isNew: true },
];

const FeedNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ["navbar-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, display_name, username")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const initial = profile?.display_name?.charAt(0)?.toUpperCase() || profile?.username?.charAt(0)?.toUpperCase() || "";

  const goCreate = (path: string) => {
    setCreateOpen(false);
    navigate(path);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--navbar))]/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1200px] w-full mx-auto grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center h-14 px-4 sm:px-6 gap-2">
          {/* Left: Logo */}
          <button onClick={() => navigate("/home")} className="text-lg font-black text-foreground tracking-tighter shrink-0 uppercase justify-self-start">
            <span className="text-primary">I</span>MAA
          </button>

          {/* Center: Nav links (desktop only) */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    active
                      ? "text-primary bg-primary/10 border-primary/20"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="text-[8px] font-black tracking-wider px-1 py-0.5 rounded bg-primary text-primary-foreground">NEW</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 justify-self-end">
            {/* Mobile search toggle */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors" aria-label="Search">
              <Search size={20} />
            </button>

            {/* Desktop search popover */}
            <Popover open={desktopSearchOpen} onOpenChange={setDesktopSearchOpen}>
              <PopoverTrigger asChild>
                <button className="hidden md:flex p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors" aria-label="Search">
                  <Search size={18} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-[360px] p-2 rounded-xl border-border/40 bg-card shadow-xl">
                <SearchBar className="w-full" />
              </PopoverContent>
            </Popover>

            <NotificationDropdown />

            <div className="w-px h-5 bg-border/60 mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-secondary transition-colors outline-none">
                  <Avatar className="w-8 h-8 rounded-lg border border-border/40">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Profile" className="object-cover" />
                    ) : null}
                    <AvatarFallback className="rounded-lg bg-secondary text-muted-foreground text-xs font-medium">
                      {initial || <User size={16} />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1 rounded-lg shadow-xl border-border/40 bg-card">
                <DropdownMenuItem onClick={() => navigate("/account")} className="rounded-md py-2 gap-2 cursor-pointer text-sm">
                  <User size={16} className="text-muted-foreground" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/publish")} className="rounded-md py-2 gap-2 cursor-pointer text-sm">
                  <Plus size={16} className="text-muted-foreground" />
                  Publish App
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/post-idea")} className="rounded-md py-2 gap-2 cursor-pointer text-sm">
                  <Lightbulb size={16} className="text-amber-500" />
                  Post Idea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded-md py-2 gap-2 cursor-pointer text-sm">
                  <Settings size={16} className="text-muted-foreground" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {searchOpen && (
          <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
            <SearchBar className="w-full" mobile />
          </div>
        )}
      </nav>

      {/* Mobile bottom nav with centered FAB */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40">
        <div className="relative grid grid-cols-5 items-end h-14">
          {/* Slot 1: Home */}
          <BottomNavItem icon={Home} label="Home" href="/home" location={location} navigate={navigate} />
          {/* Slot 2: Trending */}
          <BottomNavItem icon={TrendingUp} label="Trending" href="/trending" location={location} navigate={navigate} />

          {/* Slot 3: Center FAB */}
          <div className="flex items-start justify-center -mt-6">
            <Popover open={createOpen} onOpenChange={setCreateOpen}>
              <PopoverTrigger asChild>
                <button
                  className={`w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30 flex items-center justify-center transition-transform active:scale-95 ${createOpen ? "rotate-45" : ""}`}
                  aria-label="Create"
                >
                  {createOpen ? <X size={20} /> : <Plus size={22} />}
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-48 p-1 rounded-xl border-border/40 bg-card shadow-xl"
              >
                <button
                  onClick={() => goCreate("/publish")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Rocket size={16} className="text-primary" />
                  Publish app
                </button>
                <button
                  onClick={() => goCreate("/post-idea")}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <Lightbulb size={16} className="text-amber-500" />
                  Post idea
                </button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Slot 4: Upcoming */}
          <BottomNavItem icon={Lightbulb} label="Upcoming" href="/upcoming" location={location} navigate={navigate} />
          {/* Slot 5: Account */}
          <BottomNavItem icon={User} label="Account" href="/account" location={location} navigate={navigate} />
        </div>
      </div>
    </>
  );
};

const BottomNavItem = ({
  icon: Icon,
  label,
  href,
  location,
  navigate,
}: {
  icon: any;
  label: string;
  href: string;
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const active = location.pathname === href;
  return (
    <button
      onClick={() => navigate(href)}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 h-14 justify-center ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

export default FeedNavbar;
