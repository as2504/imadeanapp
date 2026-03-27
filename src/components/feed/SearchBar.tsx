import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, User, Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "app" | "user";
  id: string;
  slug?: string;
  name: string;
  subtitle: string;
  icon?: string;
}

const SearchBar = ({ className = "", mobile = false }: { className?: string; mobile?: boolean }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      const searchTerm = `%${query.trim()}%`;

      const [appsRes, profilesRes] = await Promise.all([
        supabase
          .from("apps")
          .select("id, app_name, slug, app_icon_url, tagline")
          .eq("status", "published")
          .ilike("app_name", searchTerm)
          .limit(5),
        supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, professional_title")
          .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
          .limit(5),
      ]);

      const combined: SearchResult[] = [];

      if (appsRes.data) {
        appsRes.data.forEach((app) =>
          combined.push({
            type: "app",
            id: app.id,
            slug: app.slug || undefined,
            name: app.app_name,
            subtitle: app.tagline || "App",
            icon: app.app_icon_url || undefined,
          })
        );
      }

      if (profilesRes.data) {
        profilesRes.data.forEach((p) =>
          combined.push({
            type: "user",
            id: p.user_id,
            name: p.display_name || p.username || "User",
            subtitle: p.professional_title || "@" + (p.username || "user"),
            icon: p.avatar_url || undefined,
          })
        );
      }

      setResults(combined);
      setOpen(combined.length > 0);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    if (result.type === "app") {
      navigate(`/app/${result.slug || result.id}`);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10"
      />
      {query && (
        <button
          onClick={() => { setQuery(""); setOpen(false); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
        >
          <X size={16} />
        </button>
      )}
      <Input
        placeholder="Search apps, creators..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="h-11 rounded-2xl bg-surface border-0 pl-12 pr-10 text-sm placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all w-full"
        autoFocus={mobile}
      />

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {loading && (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
          )}
          {!loading &&
            results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-surface border border-border/20 flex items-center justify-center shrink-0 overflow-hidden">
                  {result.icon ? (
                    <img src={result.icon} alt="" className="w-full h-full object-cover" />
                  ) : result.type === "app" ? (
                    <Box size={18} className="text-muted-foreground" />
                  ) : (
                    <User size={18} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{result.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 py-1 bg-surface rounded-lg">
                  {result.type === "app" ? "App" : "Creator"}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
