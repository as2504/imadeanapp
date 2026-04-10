import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, AppWindow, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import KPIRibbon from "@/components/admin/KPIRibbon";
import ConversionFunnel from "@/components/admin/ConversionFunnel";
import AudienceInsights from "@/components/admin/AudienceInsights";
import AppAuditTable from "@/components/admin/AppAuditTable";
import DormantApps from "@/components/admin/DormantApps";
import TrendingQueue from "@/components/admin/TrendingQueue";
import UserDrilldown from "@/components/admin/UserDrilldown";

const adminFetch = async (action: string, params?: Record<string, unknown>) => {
  const token = sessionStorage.getItem("admin_token");
  const { data, error } = await supabase.functions.invoke("admin-data", {
    body: { action, params },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  return data;
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ totalApps: 0, totalFeedback: 0, newSignups24h: 0, totalClicks: 0 });
  const [funnel, setFunnel] = useState({ impressions: 0, clicks: 0, feedback: 0 });
  const [audience, setAudience] = useState({ newUsersThisWeek: 0, totalUsers: 0, returningUsers: 0, activityByHour: Array(24).fill(0) });
  const [apps, setApps] = useState<any[]>([]);
  const [dormant, setDormant] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingDormant, setLoadingDormant] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch("global_metrics").then(setMetrics),
      adminFetch("conversion_funnel").then(setFunnel),
      adminFetch("audience_insights").then(setAudience),
    ]).catch(console.error);
  }, []);

  const searchApps = useCallback(async (q: string) => {
    setLoadingApps(true);
    try { setApps(await adminFetch("app_search", { query: q })); } finally { setLoadingApps(false); }
  }, []);

  const loadTrending = useCallback(async () => {
    setLoadingTrending(true);
    try { setTrending(await adminFetch("trending_queue")); } finally { setLoadingTrending(false); }
  }, []);

  const loadDormant = useCallback(async () => {
    setLoadingDormant(true);
    try { setDormant(await adminFetch("dormant_quality")); } finally { setLoadingDormant(false); }
  }, []);

  const searchUsers = useCallback(async (q: string) => {
    setLoadingUsers(true);
    try { setUsers(await adminFetch("user_search", { query: q })); } finally { setLoadingUsers(false); }
  }, []);

  const drilldownUser = useCallback(async (userId: string) => {
    return await adminFetch("user_drilldown", { user_id: userId });
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    navigate("/ctrl-qx-99", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><LayoutDashboard className="h-4 w-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="apps" onClick={() => apps.length === 0 && searchApps("")}>
              <AppWindow className="h-4 w-4 mr-1" />Apps
            </TabsTrigger>
            <TabsTrigger value="trending" onClick={() => trending.length === 0 && loadTrending()}>
              <TrendingUp className="h-4 w-4 mr-1" />Trending
            </TabsTrigger>
            <TabsTrigger value="users" onClick={() => users.length === 0 && searchUsers("")}>
              <Users className="h-4 w-4 mr-1" />Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <KPIRibbon {...metrics} />
            <div className="grid md:grid-cols-2 gap-6">
              <ConversionFunnel {...funnel} />
              <AudienceInsights {...audience} />
            </div>
          </TabsContent>

          <TabsContent value="apps" className="space-y-6">
            <AppAuditTable apps={apps} onSearch={searchApps} loading={loadingApps} />
            <DormantApps apps={dormant} loading={loadingDormant} />
            {dormant.length === 0 && !loadingDormant && (
              <Button variant="outline" onClick={loadDormant}>Load Dormant Quality Apps</Button>
            )}
          </TabsContent>

          <TabsContent value="trending">
            <TrendingQueue apps={trending} loading={loadingTrending} />
          </TabsContent>

          <TabsContent value="users">
            <UserDrilldown users={users} onSearch={searchUsers} onDrilldown={drilldownUser} loading={loadingUsers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
