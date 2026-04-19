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
import { Search, Home, TrendingUp, Lightbulb, User, Plus, Settings } from "lucide-react";
import SearchBar from "@/components/feed/SearchBar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";
import MobilePublishFAB from "@/components/layout/MobilePublishFAB";

const navItems = [
  { label: "Home", icon: Home, href: "/home" },
  { label: "Trending", icon: TrendingUp, href: "/trending" },
  { label: "Upcoming", icon: Lightbulb, href: "/upcoming", isNew: true },
];

const FeedNavbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(var(--navbar))]/90 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
          <button onClick={() => navigate("/home")} className="text-lg font-black text-foreground tracking-tighter shrink-0 uppercase">
            <span className="text-primary">I</span>MAA
          </button>

          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <SearchBar className="w-full" />
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              <Search size={20} />
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    location.pathname === item.href ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {item.isNew && (
                    <span className="text-[8px] font-black tracking-wider px-1 py-0.5 rounded bg-primary text-primary-foreground">NEW</span>
                  )}
                </button>
              ))}
            </div>

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

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/40">
        <div className="flex items-center justify-around h-14">
          {[
            { icon: Home, label: "Home", href: "/home" },
            { icon: TrendingUp, label: "Trending", href: "/trending" },
            { icon: Lightbulb, label: "Upcoming", href: "/upcoming" },
            { icon: User, label: "Account", href: "/account" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                location.pathname === item.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <MobilePublishFAB />
    </>
  );
};

export default FeedNavbar;
