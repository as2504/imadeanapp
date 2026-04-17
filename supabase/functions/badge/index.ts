// Embeddable rating badge — returns SVG
// GET /badge?slug=xyz&style=dark|light
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)
  );
}

function buildSvg(opts: {
  appName: string;
  rating: number;
  count: number;
  style: "dark" | "light";
}) {
  const { appName, rating, count, style } = opts;
  const dark = style === "dark";
  const bg = dark ? "#0D1117" : "#FFFFFF";
  const border = dark ? "#30363D" : "#E5E7EB";
  const fg = dark ? "#F0F6FC" : "#111827";
  const muted = dark ? "#8B949E" : "#6B7280";
  const accent = "#3FB950";

  const safeName = escapeXml(appName.length > 22 ? appName.slice(0, 22) + "…" : appName);
  const ratingTxt = rating > 0 ? rating.toFixed(1) : "New";
  const countTxt = count > 0 ? `${count} ratings` : "Be the first to rate";

  // Width auto-scaled-ish; fixed 320x64 looks clean
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="64" viewBox="0 0 320 64" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
  <rect x="0.5" y="0.5" width="319" height="63" rx="11" fill="${bg}" stroke="${border}"/>
  <g transform="translate(16, 12)">
    <rect width="40" height="40" rx="8" fill="${accent}"/>
    <text x="20" y="27" text-anchor="middle" fill="#0D1117" font-size="20" font-weight="800">I</text>
  </g>
  <g transform="translate(68, 16)">
    <text x="0" y="14" fill="${muted}" font-size="10" font-weight="600" letter-spacing="0.5">FEATURED ON IMADEANAPP</text>
    <text x="0" y="34" fill="${fg}" font-size="14" font-weight="700">${safeName}</text>
  </g>
  <g transform="translate(232, 22)">
    <text x="0" y="12" fill="${accent}" font-size="14" font-weight="700">★ ${ratingTxt}</text>
    <text x="0" y="28" fill="${muted}" font-size="10" font-weight="500">${escapeXml(countTxt)}</text>
  </g>
</svg>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const id = url.searchParams.get("id");
    const style = (url.searchParams.get("style") === "light" ? "light" : "dark") as
      | "dark"
      | "light";

    if (!slug && !id) {
      return new Response(JSON.stringify({ error: "slug or id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let q = supabase.from("apps").select("id, app_name");
    q = id ? q.eq("id", id) : q.eq("slug", slug as string);
    const { data: app } = await q.maybeSingle();
    if (!app) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("app_id", app.id);
    const arr = ratings || [];
    const avg = arr.length
      ? arr.reduce((s, r: any) => s + r.rating, 0) / arr.length
      : 0;

    const svg = buildSvg({
      appName: app.app_name,
      rating: avg,
      count: arr.length,
      style,
    });

    return new Response(svg, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e: any) {
    console.error("badge error", e);
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
