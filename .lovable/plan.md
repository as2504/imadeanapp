

# Plan: Security Hardening, Support Option, Scraping Prevention

## 1. Database migration — Tighten RLS policies

**New migration file** to:

- **profiles**: Create a `public_profiles` view excluding `date_of_birth` and `gender`. Drop the existing "Profiles are viewable by everyone" SELECT policy. Add two new policies: one for public SELECT on the view (via a security definer function), and one allowing authenticated users to SELECT their own full row (`auth.uid() = user_id`).
- **app_clicks**: Drop the public SELECT policy, replace with authenticated-only SELECT.
- **app_tries**: Drop the public SELECT policy, replace with authenticated-only SELECT.
- **profile_views**: Drop the public SELECT policy, replace with owner-only SELECT (`user_id = auth.uid()`).

## 2. Update `robots.txt`

Block non-search-engine bots from API/rest paths:

```text
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Disallow: /rest/
Disallow: /auth/
Disallow: /storage/
Allow: /
```

## 3. Add Support option in Settings

**File:** `src/pages/Settings.tsx`

- Add `Mail` to lucide imports.
- Add a "Support" section entry: `{ id: "support", label: "Support", icon: Mail, badge: null }`.
- In the desktop sidebar, place a "Support" button between the sections list and the `border-t` logout divider (line ~247).
- In the mobile dropdown, add a "Support" `CommandItem` before the "Log out" item.
- Add a "Support" content section that renders: "Need help? Drop us an email at contact@imadeanapp.com" with a `mailto:` link.

## 4. Enable leaked password protection

Use the `configure_auth` tool with `password_hibp_enabled: true`.

## Files Summary

| File | Change |
|---|---|
| `supabase/migrations/new` | Tighten RLS on profiles, app_clicks, app_tries, profile_views |
| `public/robots.txt` | Block scraper bots from API paths |
| `src/pages/Settings.tsx` | Add Support section with mailto link |
| Auth config | Enable HIBP password check |

