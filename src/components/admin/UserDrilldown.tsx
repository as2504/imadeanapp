import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface UserRow {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  appCount: number;
}

interface DrilldownData {
  profile: Record<string, unknown> | null;
  apps: { id: string; app_name: string; status: string; views_count: number | null; created_at: string }[];
  lastActivity: string | null;
}

interface UserDrilldownProps {
  users: UserRow[];
  onSearch: (q: string) => void;
  onDrilldown: (userId: string) => Promise<DrilldownData>;
  loading: boolean;
}

const UserDrilldown = ({ users, onSearch, onDrilldown, loading }: UserDrilldownProps) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DrilldownData | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleDrilldown = async (userId: string) => {
    setDrillLoading(true);
    const data = await onDrilldown(userId);
    setSelected(data);
    setDrillLoading(false);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
      </form>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="text-right">Apps</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.user_id} className="cursor-pointer" onClick={() => handleDrilldown(u.user_id)}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={u.avatar_url || ""} />
                        <AvatarFallback className="text-xs">{(u.display_name || "?")[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.display_name || "—"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">@{u.username || "—"}</TableCell>
                  <TableCell className="text-right">{u.appCount}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {drillLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : selected?.profile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={(selected.profile.avatar_url as string) || ""} />
                  <AvatarFallback>{((selected.profile.display_name as string) || "?")[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{(selected.profile.display_name as string) || "—"}</p>
                  <p className="text-sm text-muted-foreground">@{(selected.profile.username as string) || "—"}</p>
                </div>
              </div>
              {selected.profile.bio && <p className="text-sm text-muted-foreground">{selected.profile.bio as string}</p>}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Apps ({selected.apps.length})</p>
                <div className="space-y-1">
                  {selected.apps.map((a) => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{a.app_name}</span>
                      <Badge variant={a.status === "published" ? "default" : "secondary"} className="text-xs">{a.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              {selected.lastActivity && (
                <p className="text-xs text-muted-foreground">Last activity: {new Date(selected.lastActivity).toLocaleString()}</p>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDrilldown;
