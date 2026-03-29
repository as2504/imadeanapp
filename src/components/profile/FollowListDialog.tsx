import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface FollowListDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  type: "followers" | "following";
}

interface UserRow {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

const FollowListDialog = ({ open, onClose, userId, type }: FollowListDialogProps) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const fetch = async () => {
      const col = type === "followers" ? "following_id" : "follower_id";
      const joinCol = type === "followers" ? "follower_id" : "following_id";
      const { data: follows } = await supabase.from("follows").select("*").eq(col, userId);
      if (!follows || follows.length === 0) { setUsers([]); setLoading(false); return; }
      const ids = follows.map((f: any) => f[joinCol]);
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, username, avatar_url").in("user_id", ids);
      setUsers(profiles || []);
      setLoading(false);
    };
    fetch();
  }, [open, userId, type]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm bg-card border-border/40">
        <DialogHeader>
          <DialogTitle className="text-foreground">{type === "followers" ? "Followers" : "Following"}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-1">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {type === "followers" ? "No followers yet" : "Not following anyone yet"}
            </div>
          ) : (
            users.map((u) => (
              <button
                key={u.user_id}
                onClick={() => { onClose(); navigate(`/profile/${u.user_id}`); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm font-semibold text-foreground shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.display_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.display_name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">@{u.username || "user"}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
