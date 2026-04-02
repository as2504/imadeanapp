import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const appId = url.searchParams.get("id");

    if (!slug && !appId) {
      return new Response("Missing slug or id", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase.from("apps").select("app_name, tagline, app_icon_url, slug, short_description").eq("status", "published");
    if (appId) query = query.eq("id", appId);
    else if (slug) query = query.eq("slug", slug);

    const { data: app, error } = await query.maybeSingle();

    if (error || !app) {
      return new Response(JSON.stringify({ error: "App not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const title = `${app.app_name} — imadeanapp`;
    const description = app.tagline || app.short_description || "Discover this app on imadeanapp";
    const image = app.app_icon_url || "";
    const appUrl = `https://showcase-umber-one.vercel.app/app/${app.slug || appId}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${appUrl}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${appUrl}">
</head>
<body>
  <p>Redirecting to <a href="${appUrl}">${app.app_name}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
