import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface AppRow {
  id: string;
  app_name: string;
  status: string;
  tech_stack: string[] | null;
  views_count: number | null;
  clicks: number;
  saves: number;
  avgRating: number;
  slug: string | null;
}

interface AppAuditTableProps {
  apps: AppRow[];
  onSearch: (q: string) => void;
  loading: boolean;
}

const AppAuditTable = ({ apps, onSearch, loading }: AppAuditTableProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search apps by name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </form>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>App Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tech Stack</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">Saves</TableHead>
              <TableHead className="text-right">Avg Rating</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No apps found</TableCell>
              </TableRow>
            ) : (
              apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.app_name}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === "published" ? "default" : "secondary"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(app.tech_stack || []).slice(0, 3).map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{(app.views_count || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{app.clicks}</TableCell>
                  <TableCell className="text-right">{app.saves}</TableCell>
                  <TableCell className="text-right">{app.avgRating ? app.avgRating.toFixed(1) : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AppAuditTable;
