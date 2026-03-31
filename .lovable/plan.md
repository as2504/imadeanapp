

# Plan: Public App/Profile Pages, OG Tags, Build Fixes

## Summary

Three workstreams: (1) fix build errors in AppFeedback and Settings, (2) make app detail and profile pages publicly accessible without auth, with conditional UI for logged-in vs anonymous users, (3) add dynamic OG meta tags for social link unfurling via an edge function.

---

## 1. Fix Build Errors

**`AppFeedback.tsx` (line 35) and `Settings.tsx` (lines 87-88):** Both reference `app_feedback_config` which doesn't exist in the DB schema, causing `SelectQueryError` types. Fix by casting with `as any` on the data result, same pattern already used on line 30 of AppFeedback.

- `AppFeedback.tsx` line 35: `setConfig(data as any)`
- `Settings.tsx` lines 85-89: cast `data` as `any` before accessing `.is_enabled` and `.feedback_type`

---

## 2. Public Routes for App Detail and Profile

**`App.tsx`:** Remove `ProtectedRoute` wrapper from:
- `/app/:id` — render `<AppDetail />` directly
- `/profile/:userId` — render `<Profile />` directly

**`AppDetail.tsx`:** Make auth-aware instead of auth-required:
- `useAuth()` already provides `user` (null if not logged in)
- **Tabs:** Only show "Overview" tab for unauthenticated users. Hide "Reviews" and "Updates" tabs.
- **Try App button:** Always visible (opens URL without tracking if not logged in)
- **Save/Rate:** Hide save button and rate CTA if `!user`
- **Navbar:** Conditionally render `FeedNavbar` (if logged in) or a new `PublicNavbar` (if not)

**`PublicNavbar` (new component `src/components/layout/PublicNavbar.tsx`):**
- Logo left, "Log in" + "Get Started" buttons right
- No search, no Home/Trending links, no profile dropdown, no mobile bottom nav
- Same dark navbar styling as existing navbars

**`AppDetailHeader.tsx`:** Hide save/share actions if `!user` (pass `isAuthenticated` prop)

**`Profile.tsx`:** Make auth-aware:
- If `!user` and viewing `/profile/:userId`, show published apps only (no Saved/Drafts/Activity tabs)
- Use `PublicNavbar` instead of `FeedNavbar` when `!user`
- Show "Log in to publish an app" CTA banner

**`FeedNavbar.tsx`:** Add guard — `signOut` call will error if no auth context user. Since we're using `PublicNavbar` for unauthenticated pages, this is handled by not rendering `FeedNavbar` at all.

---

## 3. Dynamic OG Tags via Edge Function

Since this is a client-side SPA, social crawlers won't execute JS. We need server-side OG tag injection.

**Edge function `supabase/functions/og-meta/index.ts`:**
- Receives app slug/id as query param
- Fetches app data from DB (name, icon, tagline)
- Returns HTML with proper OG meta tags:
  - `og:title` = app name
  - `og:description` = caption/tagline
  - `og:image` = app icon URL
  - `og:url` = full app URL
  - `twitter:card` = `summary`

**`vercel.json`:** Add a rewrite rule so that when a social crawler (detected by User-Agent) hits `/app/:slug`, it gets redirected to the edge function. For regular users, the SPA loads normally.

Alternative simpler approach: Add a `<meta>` tag update in `AppDetail.tsx` using `document.title` and `react-helmet-async` (or manual `document.querySelector`). This works for users but NOT for social crawlers. For full OG support, the edge function is needed.

**Practical approach:** Use the edge function for crawlers + update `document.title` in AppDetail for browser tab titles.

---

## Files Summary

| File | Change |
|---|---|
| `src/components/app-detail/AppFeedback.tsx` | Cast `data as any` on line 35 |
| `src/pages/Settings.tsx` | Cast feedback config `data as any` |
| `src/App.tsx` | Remove `ProtectedRoute` from `/app/:id` and `/profile/:userId` |
| `src/pages/AppDetail.tsx` | Auth-aware: conditional tabs, navbar, actions |
| `src/pages/Profile.tsx` | Auth-aware: public view with limited tabs, CTA |
| `src/components/app-detail/AppDetailHeader.tsx` | Accept `isAuthenticated` prop, hide save if false |
| `src/components/layout/PublicNavbar.tsx` | **New** — minimal navbar with login/signup buttons |
| `supabase/functions/og-meta/index.ts` | **New** — OG tag HTML for social crawlers |
| `vercel.json` | Add rewrite for crawler user-agents (or keep simple SPA fallback) |
| `index.html` | Add default OG tags as fallback |

