import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getTimeAgo } from "@/lib/utils";

interface NotificationRow {
  id: string;
  type: string;
  app_id: string | null;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}

const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  const unread = items.filter((n) => !n.read).length;

  const fetchItems = async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("notifications")
      .select("id, type, app_id, title, body, read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setItems(data || []);
  };

  useEffect(() => {
    if (!user) return;
    fetchItems();
    const channel = supabase
      .channel("notif-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  };

  const handleClick = async (n: NotificationRow) => {
    setOpen(false);
    if (!n.read) {
      setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
    }
    if (n.app_id) {
      const { data: app } = await supabase.from("apps").select("slug").eq("id", n.app_id).maybeSingle();
      navigate(`/app/${app?.slug || n.app_id}`);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="hidden sm:flex relative p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-border/40 bg-card max-h-[70vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <p className="text-sm font-bold text-foreground">Notifications</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-[11px] text-primary hover:underline inline-flex items-center gap-1">
              <Check size={12} /> Mark all read
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 gap-2">
              <BellOff size={22} className="text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground text-center">When apps you follow launch, you'll see them here.</p>
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-border/30 hover:bg-secondary/40 transition-colors ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{n.title}</p>
                    {n.body && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{getTimeAgo(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
