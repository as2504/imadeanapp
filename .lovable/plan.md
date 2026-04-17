

User approved: share cards, publisher referral, embeddable rating badge. Committing to Twitter/Reddit/Discord. Skip weekly digest email & "built with [tool]" filter for now per scope.

Build order (highest leverage first):
1. **Auto OG share card per app** — biggest viral lever
2. **Publisher referral system** — viral coefficient
3. **Embeddable rating badge** — backlinks + SEO compound

Let me design each tightly. Need to check a few existing files to align with patterns.

Key decisions to lock in:
- Share card: dynamic PNG via edge function using Satori + resvg (Deno-compatible). Cache in Supabase Storage `app-assets/og-cards/{appId}.png`. Regenerate on app update.
- Referral: simple `referrals` table, `referral_code` on profile, unlock "Verified" badge at 3 successful invites (signup + 1 publish counts as successful).
- Badge: route `/badge/:slug` returns SVG (lightweight, no PNG needed). Plus copy-paste HTML snippet in publisher's app detail page (owner-only).

# Plan: Growth Engine v1 — Share Cards, Referrals, Embed Badge

## 1. Auto OG share card per app

**Goal:** Every app gets a 1200×630 PNG: app icon + name + tagline + rating + "imadeanapp" branding. Auto-set as OG image so every Twitter/Reddit/Discord share = branded preview.

**Edge function:** `supabase/functions/og-card/index.ts`
- GET `/og-card?slug=xyz` → returns PNG (cached) or generates fresh
- Uses `Satori` (`https://esm.sh/satori`) + `@resvg/resvg-js` to render JSX → SVG → PNG
- Layout: dark bg (#0D1117), app icon top-left, app name (Inter Bold 64px), tagline (32px muted), star rating + count, bottom-right "imadeanapp.com" wordmark
- Cache: upload to `app-assets/og-cards/{appId}.png`, return public URL on subsequent requests
- Trigger regeneration: on app publish/update via client call (fire-and-forget)

**Client integration:**
- `src/pages/AppDetail.tsx`: pass generated card URL to `<SEO image={...} />`
- `src/components/app-detail/AppDetailHeader.tsx`: add "Download share card" button (owner only) + "Tweet this app" button (prefilled tweet with link)

**No DB changes.** Storage bucket `app-assets` already exists & public.

## 2. Publisher referral system

**DB migration:** new table `referrals`
```
id uuid pk
referrer_id uuid (the inviter)
referred_user_id uuid (nullable until signup)
referral_code text (matches profile.referral_code)
status text ('pending'|'signed_up'|'qualified')  -- qualified = referred user published 1+ app
created_at, qualified_at
```
Add column `profiles.referral_code` (unique 8-char), `profiles.is_verified` (boolean), `profiles.referrals_count` (int).

**Logic:**
- On profile creation: generate `referral_code` (e.g. nanoid 8)
- Signup URL: `/auth?ref=ABC12345` — capture code in `Auth.tsx`, store in localStorage, attach to referral row on signup
- DB trigger on `apps` insert (status='published' OR status update to published): if user has pending referral, mark `qualified`; if referrer's qualified count hits 3 → set `is_verified=true`
- Show verified checkmark across `ProfileHeader`, `AppCard`, `TrendingCard`, `AppDetailHeader`

**UI:**
- New section in `Settings.tsx` (General): "Invite friends" — show referral link, copy button, progress bar (`X / 3 qualified invites → unlock Verified`), list of referred users with status
- Mini banner on `HomeFeed` for users without verified badge: "Invite 3 builders to unlock Verified" (dismissible)

## 3. Embeddable rating badge

**Edge function:** `supabase/functions/badge/index.ts`
- GET `/badge?slug=xyz&style=dark|light` → returns SVG (Content-Type: image/svg+xml, cached headers)
- Renders: ⭐ 4.8 · "Featured on imadeanapp" · app name
- Lightweight SVG (no Satori needed) — direct string template

**UI: new component** `src/components/app-detail/EmbedBadgeDialog.tsx`
- Owner-only button on `AppDetailHeader`: "Embed badge"
- Dialog shows live preview + copy-paste snippet:
  ```html
  <a href="https://imadeanapp.com/app/SLUG" target="_blank">
    <img src="https://[supabase-url]/functions/v1/badge?slug=SLUG" alt="Featured on imadeanapp" />
  </a>
  ```
- Tabs: Dark / Light style toggle

## Files Created

| File | Purpose |
|---|---|
| `supabase/functions/og-card/index.ts` | Generate per-app OG PNG via Satori |
| `supabase/functions/badge/index.ts` | Return per-app SVG badge |
| `src/components/app-detail/EmbedBadgeDialog.tsx` | Copy-paste embed UI |
| `src/components/settings/ReferralSection.tsx` | Invite link + progress UI |
| Migration | `referrals` table, `profiles.referral_code/is_verified/referrals_count`, qualifying trigger |

## Files Modified

| File | Change |
|---|---|
| `src/pages/AppDetail.tsx` | Use og-card URL in SEO image |
| `src/components/app-detail/AppDetailHeader.tsx` | Add "Tweet this app", "Embed badge" (owner), "Download card" buttons |
| `src/pages/Auth.tsx` | Capture `?ref=` param, persist, attach on signup |
| `src/pages/Settings.tsx` | Add Referrals subsection in General |
| `src/pages/HomeFeed.tsx` | Add dismissible referral banner for non-verified users |
| `src/components/profile/ProfileHeader.tsx`, `AppCard.tsx`, `TrendingCard.tsx`, `AppDetailHeader.tsx` | Replace hardcoded "Verified" with `profile.is_verified` check |
| `src/pages/PublishApp.tsx` | After successful publish, fire-and-forget call to `og-card` to pre-generate |

## Implementation order (single pass)

1. Migration (referrals table + profile columns + trigger) — foundation
2. `og-card` edge function + integration in AppDetail/PublishApp
3. `badge` edge function + EmbedBadgeDialog
4. Referral capture in Auth + ReferralSection in Settings + verified badge wiring
5. Tweet-this-app button + share UX polish

Ready to build on approval.

