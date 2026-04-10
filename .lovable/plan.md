

# Plan: Admin Panel with Key-Based Auth & Platform Intelligence

## Overview

Build a secure admin panel at an obfuscated route (`/ctrl-qx-99`) with master-key authentication via an edge function. The panel provides global metrics, app auditing, user drilldown, a conversion funnel, and audience insights — designed as an intervention tool, not just a dashboard.

## 1. Authentication — Edge Function + Secret

**New edge function: `supabase/functions/admin-auth/index.ts`**
- Accepts POST with `{ key: "..." }`
- Validates against `ADMIN_SECRET_KEY` secret (stored via `add_secret` tool)
- Returns a signed JWT (using `jsonwebtoken` or simple HMAC) with 24h expiry
- Frontend stores JWT in `sessionStorage` (never `localStorage`)

**New secret needed: `ADMIN_SECRET_KEY`** — will prompt you to set this.

## 2. Database — No Schema Changes

All admin queries use existing tables (`apps`, `profiles`, `ratings`, `app_clicks`, `saved_apps`, `comments`, `app_feedback_responses`, `follows`). Read-only access via the edge function using the service role key.

## 3. Edge Function: `admin-data`

A single edge function that accepts authenticated admin requests and returns data based on `action` parameter:

- `global_metrics` — total apps, total feedback, signups (last 24h), engagement velocity
- `trending_queue` — apps sorted by trending score with full telemetry
- `app_search` — search apps by name with engagement stats (clicks, saves, conversion)
- `user_search` — search users with app count, feedback sentiment, last activity
- `user_drilldown` — full user detail: bio, apps, feedback score, activity
- `dormant_quality` — high-rated apps (avg >= 4.0) with low visibility (< 10 clicks) — the key "boost" insight
- `conversion_funnel` — aggregate Impressions → Clicks → Opens → Feedback pipeline
- `audience_insights` — new vs returning users, activity heatmap, feedback behavior

## 4. Frontend — Admin Pages

**New files:**

| File | Purpose |
|---|---|
| `src/pages/AdminLogin.tsx` | Minimal dark login with single "Master Key" input |
| `src/pages/AdminPanel.tsx` | Main dashboard with tabs for all sections |
| `src/components/admin/KPIRibbon.tsx` | 4 metric cards (total apps, feedbacks, signups, engagement) |
| `src/components/admin/AppAuditTable.tsx` | Searchable table with visibility score, tech stack, report count |
| `src/components/admin/TrendingQueue.tsx` | Apps gaining traction with manual boost/demote controls |
| `src/components/admin/UserDrilldown.tsx` | Modal with user bio, apps, sentiment, activity |
| `src/components/admin/ConversionFunnel.tsx` | Visual funnel: Impressions → Clicks → Feedback |
| `src/components/admin/AudienceInsights.tsx` | New vs returning, activity patterns |
| `src/components/admin/DormantApps.tsx` | High-quality low-visibility apps for manual boost |
| `src/components/admin/AdminGuard.tsx` | Route wrapper checking sessionStorage JWT |

**Route in `App.tsx`:**
```
<Route path="/ctrl-qx-99" element={<AdminLogin />} />
<Route path="/ctrl-qx-99/panel" element={<AdminGuard><AdminPanel /></AdminGuard>} />
```

## 5. Admin Login UI

- Full-screen dark background, centered card
- Single password input field labeled "Enter Master Key"
- Calls `admin-auth` edge function
- On success, stores JWT in `sessionStorage`, redirects to `/ctrl-qx-99/panel`
- No links to this page from anywhere in the app

## 6. Admin Panel Layout

**Tab-based navigation:**
- **Overview** — KPI ribbon + conversion funnel + audience insights
- **Apps** — App audit table + dormant quality apps
- **Trending** — Trending queue with boost controls
- **Users** — User search + drilldown modal

## 7. Premium Feature Ideas (for monetization)

These are suggestions to include in the panel's data but also as future product features:

- **Creator Analytics Pro** — detailed per-app conversion funnels, audience demographics (paid tier)
- **Verified Badge System** — admin can verify creators, boosting trust and visibility
- **Featured Placement** — admin can pin apps to "Featured" section on homepage
- **Engagement Alerts** — notify creators when their app hits milestones (100 tries, first review)
- **Export Data** — CSV export of app metrics for creators (paid feature)

## Files Summary

| File | Change |
|---|---|
| `supabase/functions/admin-auth/index.ts` | New — master key validation, JWT issuance |
| `supabase/functions/admin-data/index.ts` | New — all admin data queries via service role |
| `src/pages/AdminLogin.tsx` | New — master key login UI |
| `src/pages/AdminPanel.tsx` | New — tabbed admin dashboard |
| `src/components/admin/*.tsx` | New — 8 component files for dashboard sections |
| `src/App.tsx` | Add obfuscated admin routes |

**Pre-requisite:** Will need to set `ADMIN_SECRET_KEY` secret before the auth function works.

