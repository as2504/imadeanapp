import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const encoder = new TextEncoder();

async function verifyAdmin(token: string, secret: string): Promise<boolean> {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return false;
    const data = `${header}.${body}`;
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const sigBytes = Uint8Array.from(atob(sig.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
    if (!valid) return false;
    const payload = JSON.parse(atob(body));
    if (payload.exp && Date.now() / 1000 > payload.exp) return false;
    return payload.role === "admin";
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const adminKey = Deno.env.get("ADMIN_SECRET_KEY")!;
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token || !(await verifyAdmin(token, adminKey))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { action, params } = await req.json();
  const respond = (data: unknown) => new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });

  try {
    switch (action) {
      case "global_metrics": {
        const [appsRes, feedbackRes, profilesRes, clicksRes] = await Promise.all([
          supabase.from("apps").select("id", { count: "exact", head: true }).eq("status", "published"),
          supabase.from("app_feedback_responses").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id, created_at"),
          supabase.from("app_clicks").select("id", { count: "exact", head: true }),
        ]);

        const now = new Date();
        const yesterday = new Date(now.getTime() - 86400000);
        const newSignups = (profilesRes.data || []).filter(
          (p: { created_at: string }) => new Date(p.created_at) >= yesterday
        ).length;

        return respond({
          totalApps: appsRes.count || 0,
          totalFeedback: feedbackRes.count || 0,
          newSignups24h: newSignups,
          totalClicks: clicksRes.count || 0,
        });
      }

      case "trending_queue": {
        const { data } = await supabase.rpc("get_trending_apps", {
          time_filter: params?.time_filter || "week",
          max_results: params?.max_results || 20,
        });

        const appIds = (data || []).map((d: { app_id: string }) => d.app_id);
        const { data: apps } = await supabase
          .from("apps")
          .select("id, app_name, app_icon_url, tags, tech_stack, slug, created_at, views_count")
          .in("id", appIds);

        const appMap = Object.fromEntries((apps || []).map((a: Record<string, unknown>) => [a.id, a]));
        const merged = (data || []).map((d: Record<string, unknown>) => ({
          ...d,
          ...(appMap[d.app_id as string] || {}),
        }));

        return respond(merged);
      }

      case "app_search": {
        const q = params?.query || "";
        const { data } = await supabase
          .from("apps")
          .select("id, app_name, app_icon_url, status, tags, tech_stack, views_count, likes_count, slug, created_at, user_id")
          .ilike("app_name", `%${q}%`)
          .limit(50);

        const appIds = (data || []).map((a: { id: string }) => a.id);
        const [clicksRes, savesRes, ratingsRes] = await Promise.all([
          supabase.from("app_clicks").select("app_id").in("app_id", appIds),
          supabase.from("saved_apps").select("app_id").in("app_id", appIds),
          supabase.from("ratings").select("app_id, rating").in("app_id", appIds),
        ]);

        const clickCounts: Record<string, number> = {};
        (clicksRes.data || []).forEach((c: { app_id: string }) => { clickCounts[c.app_id] = (clickCounts[c.app_id] || 0) + 1; });
        const saveCounts: Record<string, number> = {};
        (savesRes.data || []).forEach((s: { app_id: string }) => { saveCounts[s.app_id] = (saveCounts[s.app_id] || 0) + 1; });
        const ratingData: Record<string, number[]> = {};
        (ratingsRes.data || []).forEach((r: { app_id: string; rating: number }) => {
          if (!ratingData[r.app_id]) ratingData[r.app_id] = [];
          ratingData[r.app_id].push(r.rating);
        });

        const enriched = (data || []).map((a: Record<string, unknown>) => ({
          ...a,
          clicks: clickCounts[a.id as string] || 0,
          saves: saveCounts[a.id as string] || 0,
          avgRating: ratingData[a.id as string]
            ? ratingData[a.id as string].reduce((s: number, v: number) => s + v, 0) / ratingData[a.id as string].length
            : 0,
        }));

        return respond(enriched);
      }

      case "user_search": {
        const q = params?.query || "";
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, bio, created_at")
          .or(`display_name.ilike.%${q}%,username.ilike.%${q}%`)
          .limit(50);

        const userIds = (data || []).map((u: { user_id: string }) => u.user_id);
        const { data: apps } = await supabase
          .from("apps")
          .select("user_id, id")
          .in("user_id", userIds);

        const appCounts: Record<string, number> = {};
        (apps || []).forEach((a: { user_id: string }) => { appCounts[a.user_id] = (appCounts[a.user_id] || 0) + 1; });

        const enriched = (data || []).map((u: Record<string, unknown>) => ({
          ...u,
          appCount: appCounts[u.user_id as string] || 0,
        }));

        return respond(enriched);
      }

      case "user_drilldown": {
        const userId = params?.user_id;
        if (!userId) return respond({ error: "user_id required" });

        const [profileRes, appsRes, feedbackRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", userId).single(),
          supabase.from("apps").select("id, app_name, status, views_count, likes_count, created_at, slug").eq("user_id", userId),
          supabase.from("app_feedback_responses").select("created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1),
        ]);

        return respond({
          profile: profileRes.data,
          apps: appsRes.data || [],
          lastActivity: feedbackRes.data?.[0]?.created_at || null,
        });
      }

      case "dormant_quality": {
        const { data: ratings } = await supabase
          .from("ratings")
          .select("app_id, rating");

        const ratingMap: Record<string, number[]> = {};
        (ratings || []).forEach((r: { app_id: string; rating: number }) => {
          if (!ratingMap[r.app_id]) ratingMap[r.app_id] = [];
          ratingMap[r.app_id].push(r.rating);
        });

        const highRatedIds = Object.entries(ratingMap)
          .filter(([, arr]) => arr.length >= 1 && arr.reduce((s, v) => s + v, 0) / arr.length >= 4.0)
          .map(([id]) => id);

        if (highRatedIds.length === 0) return respond([]);

        const { data: clicks } = await supabase
          .from("app_clicks")
          .select("app_id")
          .in("app_id", highRatedIds);

        const clickCounts: Record<string, number> = {};
        (clicks || []).forEach((c: { app_id: string }) => { clickCounts[c.app_id] = (clickCounts[c.app_id] || 0) + 1; });

        const dormantIds = highRatedIds.filter(id => (clickCounts[id] || 0) < 10);
        if (dormantIds.length === 0) return respond([]);

        const { data: apps } = await supabase
          .from("apps")
          .select("id, app_name, app_icon_url, slug, views_count, created_at, user_id")
          .in("id", dormantIds)
          .eq("status", "published");

        const result = (apps || []).map((a: Record<string, unknown>) => ({
          ...a,
          avgRating: ratingMap[a.id as string]
            ? ratingMap[a.id as string].reduce((s: number, v: number) => s + v, 0) / ratingMap[a.id as string].length
            : 0,
          clicks: clickCounts[a.id as string] || 0,
        }));

        return respond(result);
      }

      case "conversion_funnel": {
        const [viewsRes, clicksRes, feedbackRes] = await Promise.all([
          supabase.from("apps").select("views_count").eq("status", "published"),
          supabase.from("app_clicks").select("id", { count: "exact", head: true }),
          supabase.from("app_feedback_responses").select("id", { count: "exact", head: true }),
        ]);

        const totalViews = (viewsRes.data || []).reduce(
          (sum: number, a: { views_count: number | null }) => sum + (a.views_count || 0), 0
        );

        return respond({
          impressions: totalViews,
          clicks: clicksRes.count || 0,
          feedback: feedbackRes.count || 0,
        });
      }

      case "audience_insights": {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, created_at");

        const { data: clicks } = await supabase
          .from("app_clicks")
          .select("user_id, created_at");

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        const userClickCounts: Record<string, number> = {};
        (clicks || []).forEach((c: { user_id: string }) => {
          userClickCounts[c.user_id] = (userClickCounts[c.user_id] || 0) + 1;
        });

        const newUsers = (profiles || []).filter(
          (p: { created_at: string }) => new Date(p.created_at) >= weekAgo
        ).length;

        const returning = Object.values(userClickCounts).filter(c => c > 1).length;

        // Activity by hour
        const hourBuckets = Array(24).fill(0);
        (clicks || []).forEach((c: { created_at: string }) => {
          const h = new Date(c.created_at).getUTCHours();
          hourBuckets[h]++;
        });

        return respond({
          newUsersThisWeek: newUsers,
          totalUsers: (profiles || []).length,
          returningUsers: returning,
          activityByHour: hourBuckets,
        });
      }

      default:
        return respond({ error: "Unknown action" });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
