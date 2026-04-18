// Generate per-app OG share card (1200x630 PNG) using Satori + resvg
// Cached in app-assets/og-cards/{appId}.png. Force fresh with ?refresh=1
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import satori, { init as satoriInit } from "https://esm.sh/satori@0.10.13/wasm";
import initYoga from "https://esm.sh/yoga-wasm-web@0.3.3";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

let initPromise: Promise<void> | null = null;
async function ensureInit() {
  if (!initPromise) {
    initPromise = (async () => {
      const [yogaWasm, resvgWasm] = await Promise.all([
        fetch("https://esm.sh/yoga-wasm-web@0.3.3/dist/yoga.wasm").then((r) =>
          r.arrayBuffer()
        ),
        fetch("https://esm.sh/@resvg/resvg-wasm@2.6.2/index_bg.wasm").then((
          r,
        ) => r.arrayBuffer()),
      ]);
      const yoga = await initYoga(yogaWasm);
      satoriInit(yoga);
      await initWasm(resvgWasm);
    })();
  }
  await initPromise;
}

let interFontPromise: Promise<ArrayBuffer> | null = null;
async function getInterFont(): Promise<ArrayBuffer> {
  if (!interFontPromise) {
    interFontPromise = fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff",
    ).then((r) => r.arrayBuffer());
  }
  return interFontPromise;
}

interface AppRow {
  id: string;
  app_name: string;
  tagline: string | null;
  caption: string | null;
  short_description: string | null;
  app_icon_url: string | null;
  slug: string | null;
}

function jsx(type: string, props: any) {
  return { type, props, key: null };
}

async function buildSvg(app: AppRow, avgRating: number, ratingsCount: number) {
  await ensureInit();
  const font = await getInterFont();
  const accent = "#3FB950";
  const bg = "#0D1117";
  const surface = "#161B22";
  const muted = "#8B949E";
  const fg = "#F0F6FC";

  const tagline = (app.tagline || app.caption || app.short_description || "")
    .slice(0, 110);

  const tree = jsx("div", {
    style: {
      width: 1200,
      height: 630,
      display: "flex",
      flexDirection: "column",
      background: bg,
      padding: 64,
      fontFamily: "Inter",
      color: fg,
      position: "relative",
    },
    children: [
      jsx("div", {
        style: { display: "flex", alignItems: "center", gap: 28 },
        children: [
          app.app_icon_url
            ? jsx("img", {
              src: app.app_icon_url,
              style: {
                width: 128,
                height: 128,
                borderRadius: 28,
                objectFit: "cover",
              },
            })
            : jsx("div", {
              style: {
                width: 128,
                height: 128,
                borderRadius: 28,
                background: surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                color: accent,
                fontWeight: 700,
              },
              children: app.app_name.charAt(0).toUpperCase(),
            }),
          jsx("div", {
            style: { display: "flex", flexDirection: "column", gap: 8 },
            children: [
              jsx("div", {
                style: {
                  fontSize: 64,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  maxWidth: 900,
                },
                children: app.app_name.slice(0, 40),
              }),
              avgRating > 0
                ? jsx("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 28,
                    color: accent,
                    fontWeight: 600,
                  },
                  children: [
                    jsx("span", { children: "★" }),
                    jsx("span", {
                      children: `${
                        avgRating.toFixed(1)
                      } · ${ratingsCount} ratings`,
                    }),
                  ],
                })
                : jsx("div", {
                  style: { fontSize: 24, color: muted },
                  children: "New on imadeanapp",
                }),
            ],
          }),
        ],
      }),
      jsx("div", {
        style: {
          marginTop: 40,
          fontSize: 36,
          color: muted,
          lineHeight: 1.4,
          maxWidth: 1072,
          fontWeight: 500,
        },
        children: tagline,
      }),
      jsx("div", { style: { flex: 1, display: "flex" } }),
      jsx("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderTop: `1px solid ${surface}`,
          paddingTop: 28,
        },
        children: [
          jsx("div", {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 28,
              fontWeight: 700,
            },
            children: [
              jsx("span", { style: { color: accent }, children: "I" }),
              jsx("span", { children: "MAA" }),
              jsx("span", {
                style: { color: muted, fontWeight: 500, marginLeft: 12 },
                children: "imadeanapp.com",
              }),
            ],
          }),
          jsx("div", {
            style: { fontSize: 22, color: muted, fontWeight: 500 },
            children: "Featured app",
          }),
        ],
      }),
    ],
  });

  const svg = await satori(tree as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: font, weight: 700, style: "normal" },
    ],
  });
  return svg;
}

function svgToPng(svg: string): Uint8Array {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  return resvg.render().asPng();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const appId = url.searchParams.get("id");
    const refresh = url.searchParams.get("refresh") === "1";

    if (!slug && !appId) {
      return new Response(JSON.stringify({ error: "slug or id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let q = supabase.from("apps").select(
      "id, app_name, tagline, caption, short_description, app_icon_url, slug",
    );
    q = appId ? q.eq("id", appId) : q.eq("slug", slug as string);
    const { data: app, error } = await q.maybeSingle();
    if (error || !app) {
      return new Response(JSON.stringify({ error: "not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cachePath = `og-cards/${app.id}.png`;
    const publicUrl =
      `${SUPABASE_URL}/storage/v1/object/public/app-assets/${cachePath}`;

    if (!refresh) {
      const head = await fetch(publicUrl, { method: "HEAD" });
      if (head.ok) return Response.redirect(publicUrl, 302);
    }

    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("app_id", app.id);
    const ratingsArr = ratings || [];
    const avg = ratingsArr.length
      ? ratingsArr.reduce((s, r: any) => s + r.rating, 0) / ratingsArr.length
      : 0;

    const svg = await buildSvg(app as any, avg, ratingsArr.length);
    const png = svgToPng(svg);

    const { error: upErr } = await supabase.storage
      .from("app-assets")
      .upload(cachePath, png, {
        upsert: true,
        contentType: "image/png",
        cacheControl: "3600",
      });
    if (upErr) console.error("upload err", upErr);

    return new Response(png, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e: any) {
    console.error("og-card error", e?.stack || e);
    return new Response(JSON.stringify({ error: e?.message || "error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
