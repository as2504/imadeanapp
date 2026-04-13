

# Plan: Feedback Visibility, Profile Picture Limits, PWA Icon, OG Image, Email Update

## 1. Feedback tab only visible when publisher has created feedback config

**File:** `src/pages/AppDetail.tsx`

Currently the "Feedback" tab is shown for all authenticated users on every app. Fix:
- After fetching the app, also check if `app_feedback_config` exists and is enabled for this app
- Add state `hasFeedbackConfig` (default `false`)
- Query `app_feedback_config` where `app_id = app.id` and `is_enabled = true` during the fetch
- Filter `visibleTabs`: only include "Feedback" when `hasFeedbackConfig` is `true` OR when the user is the app owner (so owners still see the setup CTA)
- The Overview tab's `<AppFeedback>` component already handles its own visibility correctly — no change needed there

## 2. Increase max questions limit from 5 to 10

**File:** `src/pages/FeedbackSetup.tsx`

- Change all occurrences of `5` to `10` for the question limit (lines ~103, 104, 314, 316, 426)
- Update the label `Questions (X/5)` → `Questions (X/10)`
- Update the toast message to "Maximum 10 questions allowed"

## 3. Profile picture 500KB size limit

**File:** `src/components/edit-profile/EditProfileAvatar.tsx`

- In the `openFileSelector` function, add a file size check before reading:
  ```typescript
  if (file.size > 500 * 1024) {
    toast({ title: "File too large", description: "Profile picture must be under 500KB.", variant: "destructive" });
    return;
  }
  ```
- This won't affect Google auth avatars since those are URLs fetched externally, not uploaded through this component

## 4. PWA icon — use IMAA logo for installed app icon

**File:** `public/manifest.json`

Update icons array to use the actual IMAA logos:
```json
{
  "icons": [
    { "src": "/logos/IMAAx192x192b.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/logos/IMAAx512x512b.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## 5. Open Graph image for imadeanapp.com homepage

**File:** `index.html`

- Add `og:image` meta tag pointing to the IMAA logo: `/logos/IMAAx512x512b.png`
- Use absolute URL: `https://imadeanapp.com/logos/IMAAx512x512b.png`
- Add `og:url` meta tag: `https://imadeanapp.com`
- Update `twitter:image` similarly

**File:** `supabase/functions/og-meta/index.ts`

- Update the hardcoded URL from `https://showcase-umber-one.vercel.app` to `https://imadeanapp.com`
- When `image` is empty (no app icon), fall back to `https://imadeanapp.com/logos/IMAAx512x512b.png`

## 6. Update email from gmail to contact@imadeanapp.com

**Files:** `src/pages/TermsAndConditions.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/Settings.tsx`

- Replace all `imadeanapp.contact@gmail.com` with `contact@imadeanapp.com` (both href and display text)

## Files Summary

| File | Change |
|---|---|
| `src/pages/AppDetail.tsx` | Conditionally show Feedback tab based on config existence |
| `src/pages/FeedbackSetup.tsx` | Change max questions from 5 → 10 |
| `src/components/edit-profile/EditProfileAvatar.tsx` | Add 500KB file size limit |
| `public/manifest.json` | Use IMAA logo PNGs for PWA icons |
| `index.html` | Add og:image and twitter:image with IMAA logo |
| `supabase/functions/og-meta/index.ts` | Fix domain URL, add fallback OG image |
| `src/pages/TermsAndConditions.tsx` | Update email |
| `src/pages/PrivacyPolicy.tsx` | Update email |
| `src/pages/Settings.tsx` | Update email |

No migration changes needed — all changes are frontend/edge function only.

