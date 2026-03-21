import { mockPosts } from "@/data/mockPosts";
import { Heart, Eye, Bookmark, X } from "lucide-react";

const saved = mockPosts.filter((p) => p.saved);

const ProfileSavedApps = () => {
  if (saved.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">🔖</p>
        <p className="text-foreground font-medium">No saved apps yet</p>
        <p className="text-sm text-muted-foreground">Bookmark apps from the feed to revisit them later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {saved.map((post) => (
        <div
          key={post.id}
          className="rounded-xl border border-border/50 p-5 hover:shadow-sm transition-shadow group relative"
        >
          <button className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100">
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
              {post.appIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{post.appName}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">by {post.publisherName}</p>
            </div>
          </div>

          <p className="text-xs text-foreground/70 mt-2.5 line-clamp-2 leading-relaxed">{post.caption}</p>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
            <span className="flex items-center gap-1 ml-auto"><Bookmark size={12} className="fill-current text-primary" /> Saved</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileSavedApps;
