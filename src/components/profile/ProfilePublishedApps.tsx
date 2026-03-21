import { mockPosts } from "@/data/mockPosts";
import { Heart, MessageSquare, Eye, Globe, Smartphone, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

const platformIcon: Record<string, React.ReactNode> = {
  web: <Globe size={12} />,
  ios: <Smartphone size={12} />,
  android: <Smartphone size={12} />,
};

const ProfilePublishedApps = () => {
  if (mockPosts.length === 0) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-4xl">📦</p>
        <p className="text-foreground font-medium">You haven't published anything yet</p>
        <p className="text-sm text-muted-foreground">Share your first vibe-coded app with the world.</p>
        <Button size="sm" className="rounded-full mt-2">Publish Your First App</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {mockPosts.map((post) => (
        <div
          key={post.id}
          className="rounded-xl border border-border/50 p-5 hover:shadow-sm transition-shadow group"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface flex items-center justify-center text-xl shrink-0">
              {post.appIcon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{post.appName}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {post.caption}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-surface text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Heart size={12} /> {post.likes}</span>
              <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.comments}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {post.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-muted-foreground/60">
                {post.platforms.map((p) => (
                  <span key={p}>{platformIcon[p]}</span>
                ))}
              </div>
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface transition-colors opacity-0 group-hover:opacity-100">
                <Pencil size={13} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfilePublishedApps;
