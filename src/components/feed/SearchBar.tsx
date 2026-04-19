import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, User, Box, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "app" | "user";
  id: string;
  slug?: string;
  name: string;
  subtitle: string;
  icon?: string;
  status?: string;
}

const RECENT_SEARCHES_KEY = "imaa_recent_searches";
const MAX_RECENT = 3;

const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
};

const addRecentSearch = (term: string) => {
  const trimmed = term.trim();
  if (!trimmed) return;
  const recent = getRecentSearches().filter(s => s.toLowerCase() !== trimmed.toLowerCase());
  recent.unshift(trimmed);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
};

const removeRecentSearch = (term: string) => {
  const recent = getRecentSearches().filter(s => s !== term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent));
};

const SearchBar = ({ className = "", mobile = false }: { className?: string; mobile?: boolean }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); setOpen(false); return; }
    setShowRecent(false);
    const timeout = setTimeout(async () => {
      setLoading(true);
      const searchTerm = `%${query.trim()}%`;
      const [appsRes, profilesRes] = await Promise.all([
        supabase.from("apps").select("id, app_name, slug, app_icon_url, tagline, status").in("status", ["published", "upcoming"]).ilike("app_name", searchTerm).limit(5),
        supabase.from("profiles").select("user_id, display_name, username, avatar_url, professional_title").or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`).limit(5),
      ]);
      const combined: SearchResult[] = [];
      appsRes.data?.forEach((app: any) => combined.push({ type: "app", id: app.id, slug: app.slug || undefined, name: app.app_name, subtitle: app.tagline || (app.status === "upcoming" ? "Upcoming idea" : "App"), icon: app.app_icon_url || undefined, status: app.status }));
      profilesRes.data?.forEach((p) => combined.push({ type: "user", id: p.user_id, name: p.display_name || p.username || "User", subtitle: p.professional_title || "@" + (p.username || "user"), icon: p.avatar_url || undefined }));
      setResults(combined);
      setOpen(true);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    addRecentSearch(result.name);
    setOpen(false);
    setShowRecent(false);
    setQuery("");
    if (result.type === "app") {
      const path = result.status === "upcoming" ? `/upcoming/${result.slug || result.id}` : `/app/${result.slug || result.id}`;
      navigate(path);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  const handleFocus = () => {
    if (query.trim().length >= 2) {
      setOpen(true);
    } else {
      const recent = getRecentSearches();
      setRecentSearches(recent);
      if (recent.length > 0) setShowRecent(true);
    }
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    setShowRecent(false);
  };

  const handleRemoveRecent = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    removeRecentSearch(term);
    const updated = getRecentSearches();
    setRecentSearches(updated);
    if (updated.length === 0) setShowRecent(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      {query && (
        <button onClick={() => { setQuery(""); setOpen(false); setShowRecent(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10">
          <X size={14} />
        </button>
      )}
      <Input
        placeholder="Search apps, creators..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onClick={handleFocus}
        className="h-9 rounded-lg bg-secondary border-0 pl-9 pr-8 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30 w-full"
        autoFocus={mobile}
      />

      {/* Recent searches dropdown */}
      {showRecent && !open && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/40 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 flex items-center gap-1.5">
            <Clock size={12} className="text-muted-foreground/50" />
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Recent</span>
          </div>
          {recentSearches.map((term) => (
            <button
              key={term}
              onClick={() => handleRecentClick(term)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
            >
              <Clock size={14} className="text-muted-foreground/40 shrink-0" />
              <span className="text-sm text-foreground truncate flex-1">{term}</span>
              <button
                onClick={(e) => handleRemoveRecent(e, term)}
                className="text-muted-foreground/30 hover:text-foreground p-0.5"
              >
                <X size={12} />
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Search results dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/40 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {loading && <div className="p-3 text-center text-sm text-muted-foreground">Searching...</div>}
          {!loading && results.length === 0 && <div className="p-3 text-center text-sm text-muted-foreground">No results</div>}
          {!loading && results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelect(result)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {result.icon ? <img src={result.icon} alt="" className="w-full h-full object-cover" /> : result.type === "app" ? <Box size={14} className="text-muted-foreground" /> : <User size={14} className="text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${result.status === "upcoming" ? "bg-amber-500/10 text-amber-500" : "text-muted-foreground/50 bg-secondary"}`}>{result.type === "app" ? (result.status === "upcoming" ? "Idea" : "App") : "Creator"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
